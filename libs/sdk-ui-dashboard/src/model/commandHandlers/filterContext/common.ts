// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { IDashboardDateFilter } from "@gooddata/sdk-model";

import { findDateFilterOptionByValue } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";
import { IDashboardCommand } from "../../commands/base.js";
import { ResetFilterContextWorkingSelection, removeAttributeFilters } from "../../commands/filters.js";
import { filterContextChanged, filterContextWorkingSelectionReseted } from "../../events/filters.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectEnableImmediateAttributeFilterDisplayAsLabelMigration } from "../../store/config/configSelectors.js";
import { selectEffectiveDateFilterOptions } from "../../store/dateFilterConfig/dateFilterConfigSelectors.js";
import {
    selectCrossFilteringFiltersLocalIdentifiers,
    selectIsCrossFiltering,
} from "../../store/drill/drillSelectors.js";
import { drillActions } from "../../store/drill/index.js";
import { selectFilterContextDefinition } from "../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../store/filterContext/index.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* dispatchFilterContextChanged(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): SagaIterator<void> {
    const filterContext: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );
    const attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides> = yield select(
        selectAttributeFilterConfigsOverrides,
    );

    yield dispatchDashboardEvent(
        filterContextChanged(ctx, filterContext, attributeFilterConfigs, cmd.correlationId),
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
    yield put(drillActions.resetCrossFiltering());
}

export function* applyWorkingSelectionHandler(ctx: DashboardContext, cmd: IDashboardCommand) {
    const enableImmediateAttributeFilterDisplayAsLabelMigration: ReturnType<
        typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
    > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);
    yield put(
        filterContextActions.applyWorkingSelection({ enableImmediateAttributeFilterDisplayAsLabelMigration }),
    );
    const isCrossFiltering: ReturnType<typeof selectIsCrossFiltering> = yield select(selectIsCrossFiltering);

    if (isCrossFiltering) {
        yield call(resetCrossFiltering, cmd);
    }
    yield call(dispatchFilterContextChanged, ctx, cmd);
}

export function* resetWorkingSelectionHandler(
    ctx: DashboardContext,
    cmd: ResetFilterContextWorkingSelection,
) {
    const { isCrossFiltering } = cmd.payload;
    yield put(filterContextActions.resetWorkingSelection());
    if (!isCrossFiltering) {
        yield put(filterContextWorkingSelectionReseted(ctx));
    }
}
