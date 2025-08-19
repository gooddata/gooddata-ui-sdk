// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, select } from "redux-saga/effects";

import { IFilter, ObjRef } from "@gooddata/sdk-model";

import { resolveFilterValues } from "./common/filterValuesResolver.js";
import { isDashboardFilter } from "../../../types.js";
import { queryWidgetFilters } from "../../queries/index.js";
import { query } from "../../store/_infra/queryCall.js";
import { selectEnableFilterValuesResolutionInDrillEvents } from "../../store/config/configSelectors.js";
import { DashboardContext, FiltersInfo } from "../../types/commonTypes.js";

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
