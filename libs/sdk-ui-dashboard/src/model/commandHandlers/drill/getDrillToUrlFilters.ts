// (C) 2021 GoodData Corporation

import { call, select, SagaReturnType } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { IFilter, ObjRef } from "@gooddata/sdk-model";
import { selectEnableFilterValuesResolutionInDrillEvents } from "../../store/config/configSelectors.js";
import { DashboardContext, FiltersInfo } from "../../types/commonTypes.js";
import { resolveFilterValues } from "./common/filterValuesResolver.js";
import { queryWidgetFilters } from "../../queries/index.js";
import { isDashboardFilter } from "../../../types.js";
import { query } from "../../store/_infra/queryCall.js";

export function* getDrillToUrlFiltersWithResolvedValues(
    ctx: DashboardContext,
    widgetRef: ObjRef,
): SagaIterator<FiltersInfo> {
    // override all insight filters by passing null as insight
    const effectiveFilters: IFilter[] = yield call(query, queryWidgetFilters(widgetRef, null));
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
