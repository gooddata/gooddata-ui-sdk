// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import {
    type IFilter,
    type ObjRef,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
} from "@gooddata/sdk-model";

import { isDashboardFilter } from "../../../types.js";
import { queryWidgetFilters } from "../../queries/widgets.js";
import { query } from "../../store/_infra/queryCall.js";
import { selectEnableFilterValuesResolutionInDrillEvents } from "../../store/config/configSelectors.js";
import { type DashboardContext, type FiltersInfo, type ResolvableFilter } from "../../types/commonTypes.js";
import { resolveFilterValues } from "./common/filterValuesResolver.js";

export function* getDrillToUrlFiltersWithResolvedValues(
    ctx: DashboardContext,
    widgetRef: ObjRef,
): SagaIterator<FiltersInfo> {
    // override all insight filters by passing null as insight
    const effectiveFilters: IFilter[] = yield call(query, queryWidgetFilters(widgetRef, null));
    // Measure value filters are not part of the drill-to-URL payload in this iteration —
    // downstream consumers (e.g. mapDashboardFiltersToEmbeddedFilters in gdc-dashboards) only
    // know about attribute and date filters and throw on anything else.
    // TODO INE: revisit when MVFs become part of the drill payload in
    // https://gooddata.atlassian.net/browse/CQ-2286.
    const filters = effectiveFilters.filter(isDashboardFilter).filter((f) => !isMeasureValueFilter(f));

    const enableFilterValuesResolutionInDrillEvents: SagaReturnType<
        typeof selectEnableFilterValuesResolutionInDrillEvents
    > = yield select(selectEnableFilterValuesResolutionInDrillEvents);

    if (enableFilterValuesResolutionInDrillEvents) {
        const resolvableFilters: ResolvableFilter[] = filters.filter(
            (f): f is ResolvableFilter => isAttributeFilter(f) || isDateFilter(f),
        );
        const resolvedFilterValues: SagaReturnType<typeof resolveFilterValues> = yield call(
            resolveFilterValues,
            resolvableFilters,
            ctx.backend,
            ctx.workspace,
        );

        return { filters, resolvedFilterValues };
    }

    return { filters };
}
