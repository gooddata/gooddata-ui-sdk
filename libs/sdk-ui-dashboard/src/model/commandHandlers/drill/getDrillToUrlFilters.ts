// (C) 2021 GoodData Corporation

import { call, select, SagaReturnType } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { IFilter, ObjRef } from "@gooddata/sdk-model";
import { selectEnableFilterValuesResolutionInDrillEvents } from "../../store/config/configSelectors";
import { DashboardContext, FiltersInfo } from "../../types/commonTypes";
import { resolveFilterValues } from "./common/filterValuesResolver";
import { queryWidgetFilters } from "../../queries";
import { isDashboardFilter } from "../../../types";
import { query } from "../../store/_infra/queryCall";

export function* getDrillToUrlFiltersWithResolvedValues(
    ctx: DashboardContext,
    widgetRef: ObjRef,
): SagaIterator<FiltersInfo> {
    // empty widgetFilterOverrides array is passed to override all insight filters
    const effectiveFilters: IFilter[] = yield call(query, queryWidgetFilters(widgetRef, []));
    const filters = effectiveFilters.filter(isDashboardFilter);

    const enableFilterValuesResolutionInDrillEvents: SagaReturnType<
        typeof selectEnableFilterValuesResolutionInDrillEvents
    > = yield select(selectEnableFilterValuesResolutionInDrillEvents);

    if (enableFilterValuesResolutionInDrillEvents) {
        const resolvedFilterValues: SagaReturnType<typeof resolveFilterValues> = yield call(
            resolveFilterValues,
            filters,
            ctx.backend,
            ctx.workspace,
        );

        return { filters, resolvedFilterValues };
    }

    return { filters };
}
