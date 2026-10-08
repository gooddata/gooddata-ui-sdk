// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    type IDateFilter,
    type IFilter,
    type IInsightDefinition,
    type IKpiWidget,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    areObjRefsEqual,
    filterObjRef,
    insightFilters,
    isAttributeFilter,
    isDateFilter,
    isInsightWidget,
    isMeasureValueFilter,
    isNoopAllTimeDateFilter,
    isRankingFilter,
    newAllTimeFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { invalidQueryArguments } from "../events/general.js";
import { type IQueryWidgetFilters } from "../queries/widgets.js";
import { createQueryService } from "../store/_infra/queryService.js";
import { selectSupportsMultipleDateFilters } from "../store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectInsightByRef } from "../store/insights/insightsSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectAllFiltersForWidgetByRef,
    selectFilterableWidgetByRef,
} from "../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../types/commonTypes.js";
import { type FilterableDashboardWidget, type ICustomWidget } from "../types/layoutTypes.js";
import {
    type IFilterDateDatasetPair,
    resolveWidgetDashboardFilters,
    selectDateDatasetsForDateFilters,
} from "../utils/widgetFilters.js";

export const QueryWidgetFiltersService = createQueryService("GDC.DASH/QUERY.WIDGET.FILTERS", queryService);

function resolveDateFilters(
    insightDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
    dashboardDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
    supportsMultipleDateFilters: boolean,
): IDateFilter[] {
    // prioritize dashboard filters over insight ones
    // and strip useless all time filters at the end
    const init = dashboardDateFilterDateDatasetPairs
        .filter((item) => !!item.dateDatasetLink)
        .map((item) => item.filter);
    return insightDateFilterDateDatasetPairs
        .filter((item) => !!item.dateDatasetLink)
        .reduceRight((acc: IDateFilter[], curr) => {
            const alreadyPresent = acc.some((item) =>
                areObjRefsEqual(filterObjRef(item), curr.dateDatasetLink),
            );

            if (!alreadyPresent) {
                acc.push(curr.filter);
            }

            return acc;
        }, init)
        .filter((item) => {
            if (supportsMultipleDateFilters) {
                return true;
            } else {
                return !isNoopAllTimeDateFilter(item);
            }
        });
}

export function* queryWithInsight(
    _ctx: DashboardContext,
    widget: FilterableDashboardWidget,
    insight: IInsightDefinition,
): SagaIterator<IFilter[]> {
    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const [widgetAwareDashboardCommonDateFilters, widgetAwareDashboardOtherFilters]: ReturnType<
        typeof widgetAwareDashboardFiltersSelector
    > = yield select(widgetAwareDashboardFiltersSelector);

    const supportsMultipleDateFilters = yield select(selectSupportsMultipleDateFilters);
    // add all time filter explicitly in case the date widgetAwareDashboardFilters are empty
    // this will cause the all time filter to be used instead of the insight date filter
    // if the dashboard date filter is not ignored by the widget
    if (!widgetAwareDashboardCommonDateFilters.length && widget.dateDataSet) {
        widgetAwareDashboardCommonDateFilters.push(
            newAllTimeFilter(widget.dateDataSet, generateDateFilterLocalIdentifier(0, widget.dateDataSet)),
        );
    }

    const effectiveInsightFilters = insightFilters(insight);
    const displayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> = yield select(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const dashboardFilters = resolveWidgetDashboardFilters(
        widget,
        [widgetAwareDashboardCommonDateFilters, widgetAwareDashboardOtherFilters],
        displayAsLabelMap,
        effectiveInsightFilters,
    );
    const dateFilters = resolveDateFilters(
        selectDateDatasetsForDateFilters(effectiveInsightFilters.filter(isDateFilter)),
        dashboardFilters.dateFilters,
        supportsMultipleDateFilters,
    );

    return [
        ...dateFilters,
        // only dashboard filters are subject to widget ignores
        ...dashboardFilters.attributeFilters,
        ...effectiveInsightFilters.filter(isAttributeFilter),
        /**
         * Strictly speaking, there should be a resolution here that makes sure there is at most one MVF per measure.
         * This, however, is not worth the hassle: AD will not allow creating such insight, so the only way this might
         * happen is if widgetFilterOverrides have this clash (or someone created an insight manually using API directly).
         *
         * We choose to not do it here as doing it would need extension of the SPI with some getMeasures method
         * (because the catalog API cannot be used here as we do not know which dataset the given measure might come from)
         * and we do not want that extension at the moment (catalog API should still be good enough for most use cases).
         *
         * Dashboard-level MVFs and insight-level MVFs are sent to execution together (logical AND). Incompatible
         * dashboard MVFs (referencing metrics not in the widget) are silently ignored by the backend, so no
         * compatibility check is performed at execution time.
         */
        ...dashboardFilters.measureValueFilters,
        ...effectiveInsightFilters.filter(isMeasureValueFilter),
        // nothing to resolve for ranking filters
        ...effectiveInsightFilters.filter(isRankingFilter),
    ];
}

function* queryWithoutInsight(
    widget: IKpiWidget | ICustomWidget | IRichTextWidget | IVisualizationSwitcherWidget,
): SagaIterator<IFilter[]> {
    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const [widgetAwareDashboardCommonDateFilters, widgetAwareDashboardOtherFilters]: ReturnType<
        typeof widgetAwareDashboardFiltersSelector
    > = yield select(widgetAwareDashboardFiltersSelector);

    const supportsMultipleDateFilters = yield select(selectSupportsMultipleDateFilters);

    const displayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> = yield select(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const dashboardFilters = resolveWidgetDashboardFilters(
        widget,
        [widgetAwareDashboardCommonDateFilters, widgetAwareDashboardOtherFilters],
        displayAsLabelMap,
    );

    return [
        ...resolveDateFilters([], dashboardFilters.dateFilters, supportsMultipleDateFilters),
        ...dashboardFilters.attributeFilters,
        ...dashboardFilters.measureValueFilters,
    ];
}

function* queryService(ctx: DashboardContext, query: IQueryWidgetFilters): SagaIterator<IFilter[]> {
    const {
        payload: { widgetRef, insight },
        correlationId,
    } = query;
    const widgetSelector = selectFilterableWidgetByRef(widgetRef);
    const widget: ReturnType<typeof widgetSelector> = yield select(widgetSelector);

    if (!widget) {
        throw invalidQueryArguments(
            ctx,
            `Widget with ref ${objRefToString(widgetRef)} does not exist on the dashboard`,
            correlationId,
        );
    }

    if (insight) {
        return yield call(queryWithInsight, ctx, widget, insight);
    } else {
        if (isInsightWidget(widget)) {
            const insightRef = widget.insight;
            const insightSelector = selectInsightByRef(insightRef);
            const linkedInsight: ReturnType<typeof insightSelector> = yield select(insightSelector);

            if (!linkedInsight) {
                throw invalidQueryArguments(
                    ctx,
                    `Insight with ref ${objRefToString(insightRef)} does not exist on the dashboard`,
                    correlationId,
                );
            }

            return yield call(queryWithInsight, ctx, widget, linkedInsight);
        } else {
            return yield call(queryWithoutInsight, widget);
        }
    }
}
