// (C) 2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import { type IInsightParameterValue, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IDashboardCommand } from "../../commands/base.js";
import { type IChangeParameterValues } from "../../commands/parameters.js";
import { parametersChanged } from "../../events/parameters.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectEnableParameters } from "../../store/config/configSelectors.js";
import { selectEnablePersistentFiltersAcrossTabs } from "../../store/meta/metaSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import {
    selectDashboardParametersByTab,
    selectParameterResetTargetsByTab,
    selectParameterValuesByTab,
} from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type ITabSyncSession, beginTabSync, putTabSynced } from "../filterContext/tabSync/tabSyncSaga.js";

/**
 * Parameters not present on a written tab are ignored by the reducer. When persistent filters
 * across tabs are on, the same values are written to every tab, or with `restorePerTabOriginals`
 * every other tab resets them to its own reset values. A change event is emitted for
 * each tab whose applied values differ from the snapshot, source tab first.
 *
 * @internal
 */
export function* changeParameterValuesHandler(
    ctx: DashboardContext,
    cmd: IChangeParameterValues,
): SagaIterator<void> {
    const enableParameters: ReturnType<typeof selectEnableParameters> = yield select(selectEnableParameters);
    if (!enableParameters) {
        return;
    }

    const { parameters, tabLocalIdentifier, restorePerTabOriginals } = cmd.payload;
    const tabId: string = tabLocalIdentifier ?? (yield select(selectActiveOrDefaultTabLocalIdentifier));
    const valuesBefore: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);
    const session: ITabSyncSession = yield call(beginTabSync, {
        tabLocalIdentifier,
        enabled: !restorePerTabOriginals,
    });
    const restoreActions: SagaReturnType<typeof getOtherTabsParameterResetActions> = restorePerTabOriginals
        ? yield call(getOtherTabsParameterResetActions, tabId)
        : [];

    yield call(putTabSynced, session, [
        tabsActions.setParameterRuntimeValues({ values: parameters, tabLocalIdentifier }),
        ...restoreActions,
    ]);

    yield call(dispatchParametersChangedForAffectedTabs, ctx, cmd, valuesBefore, tabId);
}

/**
 * When filters persist across tabs, every other tab resets the parameters that `sourceTabId` defines
 * to its own reset values.
 */
function* getOtherTabsParameterResetActions(
    sourceTabId: string,
): SagaIterator<ReturnType<typeof tabsActions.setParameterRuntimeValues>[]> {
    const persistAcrossTabs: ReturnType<typeof selectEnablePersistentFiltersAcrossTabs> = yield select(
        selectEnablePersistentFiltersAcrossTabs,
    );
    if (!persistAcrossTabs) {
        return [];
    }
    const parametersByTab: ReturnType<typeof selectDashboardParametersByTab> = yield select(
        selectDashboardParametersByTab,
    );
    const resetTargetsByTab: ReturnType<typeof selectParameterResetTargetsByTab> = yield select(
        selectParameterResetTargetsByTab,
    );
    const sourceParameters = parametersByTab[sourceTabId] ?? [];

    return Object.entries(resetTargetsByTab).flatMap(([tabLocalIdentifier, targets]) => {
        if (tabLocalIdentifier === sourceTabId) {
            return [];
        }
        const values = targets.filter((target) =>
            sourceParameters.some((parameter) => areObjRefsEqual(parameter.ref, target.ref)),
        );
        return values.length > 0
            ? [tabsActions.setParameterRuntimeValues({ values, tabLocalIdentifier })]
            : [];
    });
}

/**
 * Emits one `GDC.DASH/EVT.PARAMETERS.CHANGED` per tab whose applied values changed. Local parameter
 * state is stored from that event, so every written tab has to emit or its saved value stays stale.
 *
 * @internal
 */
export function* dispatchParametersChangedForAffectedTabs(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    valuesBefore: Record<string, IInsightParameterValue[] | undefined>,
    sourceTabId: string,
): SagaIterator<void> {
    const valuesByTab: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);
    const tabIds = [sourceTabId, ...Object.keys(valuesByTab).filter((id) => id !== sourceTabId)];
    for (const tabId of tabIds) {
        yield call(dispatchParametersChanged, ctx, cmd, tabId, valuesBefore[tabId]);
    }
}

/**
 * Emits `GDC.DASH/EVT.PARAMETERS.CHANGED` only when the tab's applied values differ from the snapshot.
 * Emits nothing when the tab does not exist.
 *
 * @internal
 */
export function* dispatchParametersChanged(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    tabLocalIdentifier: string,
    valuesBefore: IInsightParameterValue[] | undefined,
): SagaIterator<void> {
    const valuesByTab: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);
    const values = valuesByTab[tabLocalIdentifier];
    if (values === undefined || isEqual(valuesBefore, values)) {
        return;
    }

    yield dispatchDashboardEvent(parametersChanged(ctx, values, tabLocalIdentifier, cmd.correlationId));
}
