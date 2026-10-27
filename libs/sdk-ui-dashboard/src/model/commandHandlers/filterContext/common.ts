// (C) 2021-2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IFilterContextDefinition,
} from "@gooddata/sdk-model";

import { findDateFilterOptionByValue } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";
import { type IDashboardCommand } from "../../commands/base.js";
import { removeAttributeFilters } from "../../commands/filters.js";
import { filterContextChanged, filterContextWorkingSelectionApplied } from "../../events/filters.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectEnableImmediateAttributeFilterDisplayAsLabelMigration } from "../../store/config/configSelectors.js";
import {
    selectCrossFilteringFiltersLocalIdentifiers,
    selectIsCrossFiltering,
} from "../../store/drill/drillSelectors.js";
import { drillActions } from "../../store/drill/index.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectAttributeFilterConfigsOverridesByTab,
} from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectEffectiveDateFilterOptions } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import {
    selectFilterContextDefinition,
    selectFilterContextDefinitionsByTab,
    selectIsWorkingFilterContextChanged,
    selectWorkingFilterContextDefinitionsByTab,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { type IWorkingFilterContextDefinition } from "../../store/tabs/filterContext/filterContextState.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectParameterValuesByTab } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { dispatchParametersChangedForAffectedTabs } from "../parameters/changeParameterValuesHandler.js";

import { type ITabSyncSession, beginTabSync, endTabSync, putTabSynced } from "./tabSync/tabSyncSaga.js";

/**
 * Applied filter context and attribute filter configs of every tab, taken before a write.
 * Compared with the store afterwards so a mirrored change emits one event per tab updated.
 */
export interface IFilterContextByTabSnapshot {
    readonly filterContexts: Record<string, IFilterContextDefinition | undefined>;
    readonly workingFilterContexts: Record<string, IWorkingFilterContextDefinition | undefined>;
    readonly attributeFilterConfigs: Record<string, IDashboardAttributeFilterConfig[]>;
}

export function* captureFilterContextByTabSnapshot(): SagaIterator<IFilterContextByTabSnapshot> {
    const filterContexts: ReturnType<typeof selectFilterContextDefinitionsByTab> = yield select(
        selectFilterContextDefinitionsByTab,
    );
    const workingFilterContexts: ReturnType<typeof selectWorkingFilterContextDefinitionsByTab> = yield select(
        selectWorkingFilterContextDefinitionsByTab,
    );
    const attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverridesByTab> =
        yield select(selectAttributeFilterConfigsOverridesByTab);
    return { filterContexts, workingFilterContexts, attributeFilterConfigs };
}

/**
 * Emits a filter context changed event for every tab that differs from `snapshot`, except `skippedTabId`.
 */
export function* dispatchFilterContextChangedForMutatedTabs(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    snapshot: IFilterContextByTabSnapshot,
    skippedTabId?: string,
): SagaIterator<void> {
    const filterContexts: ReturnType<typeof selectFilterContextDefinitionsByTab> = yield select(
        selectFilterContextDefinitionsByTab,
    );
    const attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverridesByTab> =
        yield select(selectAttributeFilterConfigsOverridesByTab);
    const workingFilterContexts: ReturnType<typeof selectWorkingFilterContextDefinitionsByTab> = yield select(
        selectWorkingFilterContextDefinitionsByTab,
    );

    for (const tabId of Object.keys(filterContexts)) {
        if (!filterContexts[tabId] || tabId === skippedTabId) {
            continue;
        }
        const configs = attributeFilterConfigs[tabId] ?? [];
        if (
            isEqual(snapshot.filterContexts[tabId], filterContexts[tabId]) &&
            isEqual(snapshot.workingFilterContexts[tabId], workingFilterContexts[tabId]) &&
            isEqual(snapshot.attributeFilterConfigs[tabId] ?? [], configs)
        ) {
            continue;
        }
        yield call(dispatchFilterContextChanged, ctx, cmd, tabId);
    }
}

export function* dispatchFilterContextChanged(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    tabLocalIdentifier?: string,
): SagaIterator<void> {
    let filterContext: ReturnType<typeof selectFilterContextDefinition>;
    let attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides>;

    if (tabLocalIdentifier) {
        // Read from specific tab
        const filterContextsByTab: ReturnType<typeof selectFilterContextDefinitionsByTab> = yield select(
            selectFilterContextDefinitionsByTab,
        );
        const attributeFilterConfigsByTab: ReturnType<typeof selectAttributeFilterConfigsOverridesByTab> =
            yield select(selectAttributeFilterConfigsOverridesByTab);

        invariant(
            filterContextsByTab[tabLocalIdentifier],
            `Filter context not found for tab ${tabLocalIdentifier}`,
        );

        filterContext = filterContextsByTab[tabLocalIdentifier]!;
        attributeFilterConfigs = attributeFilterConfigsByTab[tabLocalIdentifier] ?? [];
    } else {
        // Read from active tab (default behavior)
        filterContext = yield select(selectFilterContextDefinition);
        attributeFilterConfigs = yield select(selectAttributeFilterConfigsOverrides);
    }

    yield dispatchDashboardEvent(
        filterContextChanged(
            ctx,
            filterContext,
            attributeFilterConfigs,
            cmd.correlationId,
            tabLocalIdentifier,
        ),
    );
}

export function* canApplyDateFilter(dateFilter: IDashboardDateFilter): SagaIterator<boolean> {
    const effectiveDateFilterOptions: ReturnType<typeof selectEffectiveDateFilterOptions> = yield select(
        selectEffectiveDateFilterOptions,
    );

    const targetOption = findDateFilterOptionByValue(dateFilter, effectiveDateFilterOptions);

    if (!targetOption) {
        if (dateFilter.dateFilter.type === "absolute") {
            return !!effectiveDateFilterOptions?.absoluteForm?.visible;
        } else if (dateFilter.dateFilter.type === "relative") {
            if (
                dateFilter.dateFilter.granularity === "GDC.time.date" &&
                dateFilter.dateFilter.from === undefined &&
                dateFilter.dateFilter.to === undefined
            ) {
                return !!effectiveDateFilterOptions?.allTime?.visible;
            }
            return !!effectiveDateFilterOptions?.relativeForm?.visible;
        }
    }

    return !!targetOption;
}

export function* resetCrossFiltering(cmd: IDashboardCommand) {
    const virtualFilters: ReturnType<typeof selectCrossFilteringFiltersLocalIdentifiers> = yield select(
        selectCrossFilteringFiltersLocalIdentifiers,
    );
    yield put(removeAttributeFilters(virtualFilters, cmd.correlationId));

    const activeTabId: ReturnType<typeof selectActiveOrDefaultTabLocalIdentifier> = yield select(
        selectActiveOrDefaultTabLocalIdentifier,
    );
    yield put(drillActions.resetCrossFiltering(activeTabId));
}

export function* applyWorkingSelectionHandler(ctx: DashboardContext, cmd: IDashboardCommand) {
    const enableImmediateAttributeFilterDisplayAsLabelMigration: ReturnType<
        typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
    > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);
    // Read before the commit clears the staged overlay. A parameter-only apply must keep
    // cross-filtering alive, so only a staged filter change may drop it.
    const isWorkingFilterContextChanged: ReturnType<typeof selectIsWorkingFilterContextChanged> =
        yield select(selectIsWorkingFilterContextChanged);
    const tabId: ReturnType<typeof selectActiveOrDefaultTabLocalIdentifier> = yield select(
        selectActiveOrDefaultTabLocalIdentifier,
    );
    const valuesBefore: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);
    const session: ITabSyncSession = yield call(beginTabSync);

    yield call(putTabSynced, session, [
        tabsActions.applyWorkingSelection({ enableImmediateAttributeFilterDisplayAsLabelMigration }),
    ]);
    const isCrossFiltering: ReturnType<typeof selectIsCrossFiltering> = yield select(selectIsCrossFiltering);

    if (isWorkingFilterContextChanged && isCrossFiltering) {
        yield call(resetCrossFiltering, cmd);
    }
    yield dispatchDashboardEvent(filterContextWorkingSelectionApplied(ctx, cmd.correlationId));

    yield call(endTabSync, ctx, cmd, session);

    yield call(dispatchParametersChangedForAffectedTabs, ctx, cmd, valuesBefore, tabId);
}

export function* resetWorkingSelectionHandler() {
    yield put(tabsActions.resetWorkingSelection());
}
