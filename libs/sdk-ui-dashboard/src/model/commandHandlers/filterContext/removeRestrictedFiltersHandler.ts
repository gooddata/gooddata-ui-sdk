// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import {
    isDashboardAttributeFilterItem,
    isDashboardDateFilterWithDimension,
    isDashboardMeasureValueFilter,
} from "@gooddata/sdk-model";

import {
    type IRemoveDateFilters,
    type IRemoveRestrictedFilters,
    removeAttributeFilters,
    removeMeasureValueFilters,
} from "../../commands/filters.js";
import {
    filterLocalIdentifiers,
    selectReportedRestrictedDashboardFilters,
} from "../../store/filtering/dashboardFilterSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

import { removeAttributeFiltersHandler } from "./attributeFilter/removeAttributeFiltersHandler.js";
import { removeDateFiltersHandler } from "./dateFilter/removeDateFiltersHandler.js";
import { removeMeasureValueFilterHandler } from "./measureValueFilter/removeMeasureValueFilterHandler.js";

/**
 * Removes the filters the active tab's notice reports. Each type goes through its own removal handler,
 * which is what cleans up the dependencies, configs and widget ignore lists the filter leaves behind.
 */
export function* removeRestrictedFiltersHandler(
    ctx: DashboardContext,
    cmd: IRemoveRestrictedFilters,
): SagaIterator<void> {
    const restricted: ReturnType<typeof selectReportedRestrictedDashboardFilters> = yield select(
        selectReportedRestrictedDashboardFilters,
    );

    const attributeFilterLocalIds = [
        ...filterLocalIdentifiers(restricted.filter(isDashboardAttributeFilterItem)),
    ];
    const measureValueFilterLocalIds = [
        ...filterLocalIdentifiers(restricted.filter(isDashboardMeasureValueFilter)),
    ];
    const dateFilterDataSets = restricted
        .filter(isDashboardDateFilterWithDimension)
        .map((filter) => filter.dateFilter.dataSet!);

    if (attributeFilterLocalIds.length) {
        yield call(
            removeAttributeFiltersHandler,
            ctx,
            removeAttributeFilters(attributeFilterLocalIds, cmd.correlationId),
        );
    }

    if (dateFilterDataSets.length) {
        // there is no factory taking more than one data set
        const command: IRemoveDateFilters = {
            type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.REMOVE",
            correlationId: cmd.correlationId,
            payload: { dataSets: dateFilterDataSets },
        };
        yield call(removeDateFiltersHandler, ctx, command);
    }

    if (measureValueFilterLocalIds.length) {
        yield call(
            removeMeasureValueFilterHandler,
            ctx,
            removeMeasureValueFilters(measureValueFilterLocalIds, cmd.correlationId),
        );
    }
}
