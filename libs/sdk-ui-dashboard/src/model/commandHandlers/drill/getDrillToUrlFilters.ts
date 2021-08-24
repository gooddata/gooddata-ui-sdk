// (C) 2021 GoodData Corporation

import { call, select, SagaReturnType } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { ObjRef } from "@gooddata/sdk-model";
import { selectEnableFilterValuesResolutionInDrillEvents } from "../../state/config/configSelectors";
import { DashboardContext, FiltersInfo } from "../../types/commonTypes";
import { resolveFilterValues } from "./common/filterValuesResolver";
import { queryWidgetFilters } from "../../queries";
import { QueryWidgetFiltersService } from "../../queryServices/queryWidgetFilters";
import { isDashboardFilter } from "../../../types";

export function* getDrillToUrlFiltersWithResolvedValues(
    ctx: DashboardContext,
    widgetRef: ObjRef,
): SagaIterator<FiltersInfo> {
    const query = queryWidgetFilters(widgetRef);
    const effectiveFilters: SagaReturnType<typeof QueryWidgetFiltersService.generator> = yield call(
        QueryWidgetFiltersService.generator,
        ctx,
        query,
    );
    const filters = effectiveFilters.filter(isDashboardFilter);

    const enableFilterValuesResolutionInDrillEvents: SagaReturnType<
        typeof selectEnableFilterValuesResolutionInDrillEvents
    > = yield select(selectEnableFilterValuesResolutionInDrillEvents);
    if (enableFilterValuesResolutionInDrillEvents) {
        const resolvedFilterValues: SagaReturnType<typeof resolveFilterValues> = yield call(
            resolveFilterValues,
            filters,
        );

        return { filters, resolvedFilterValues };
    }

    return { filters };
}
