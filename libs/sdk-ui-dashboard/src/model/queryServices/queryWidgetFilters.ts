// (C) 2021-2026 GoodData Corporation

import { compact, isEmpty } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, all, call, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeFilter,
    type IDateFilter,
    type IFilter,
    type IInsightDefinition,
    type IKpiWidget,
    type IMetadataObject,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    type ObjRef,
    type ObjectType,
    areObjRefsEqual,
    filterLocalIdentifier,
    filterObjRef,
    idRef,
    insightFilters,
    isAttributeFilter,
    isDashboardAttributeFilterReference,
    isDashboardDateFilterReference,
    isDateFilter,
    isInsightWidget,
    isMeasureValueFilter,
    isNoopAllTimeDateFilter,
    isRankingFilter,
    newAllTimeFilter,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";

import { invalidQueryArguments } from "../events/general.js";
import { type IQueryWidgetFilters } from "../queries/widgets.js";
import { createQueryService } from "../store/_infra/queryService.js";
import { selectSupportsMultipleDateFilters } from "../store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectEnableDateFilterIdentifiers } from "../store/config/configSelectors.js";
import { selectInsightByRef } from "../store/insights/insightsSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectAllFiltersForWidgetByRef,
    selectFilterableWidgetByRef,
} from "../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../types/commonTypes.js";
import { type FilterableDashboardWidget, type ICustomWidget } from "../types/layoutTypes.js";
import { resolveDisplayFormMetadata } from "../utils/displayFormResolver.js";

export const QueryWidgetFiltersService = createQueryService("GDC.DASH/QUERY.WIDGET.FILTERS", queryService);

function refMatchesMdObject(ref: ObjRef, mdObject: IMetadataObject, type?: ObjectType): boolean {
    return (
        areObjRefsEqual(ref, mdObject.ref) ||
        areObjRefsEqual(ref, idRef(mdObject.id, type)) ||
        areObjRefsEqual(ref, uriRef(mdObject.uri))
    );
}

interface IFilterDisplayFormPair {
    filter: IAttributeFilter;
    displayForm: IAttributeDisplayFormMetadataObject;
}

interface IFilterDateDatasetPair {
    filter: IDateFilter;
    dateDatasetLink: ObjRef | undefined;
}

function* loadDisplayFormsForAttributeFilters(
    ctx: DashboardContext,
    filters: IAttributeFilter[],
): SagaIterator<IFilterDisplayFormPair[]> {
    const refs = filters.map(filterObjRef);

    const resolvedObjects: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        compact(refs),
    );

    // if some display forms could not be resolved then there is something seriously amiss
    invariant(isEmpty(resolvedObjects.missing));

    return filters.map((filter) => {
        return {
            filter,
            displayForm: resolvedObjects.resolved.get(filterObjRef(filter))!,
        };
    });
}

function selectDateDatasetsForDateFilters(filters: IDateFilter[]): IFilterDateDatasetPair[] {
    return filters.map((filter): IFilterDateDatasetPair => {
        return {
            dateDatasetLink: filterObjRef(filter),
            filter,
        };
    });
}

function* getResolvedInsightAttributeFilters(
    ctx: DashboardContext,
    widget: FilterableDashboardWidget,
    dashboardAttributeFilters: IAttributeFilter[],
    insightAttributeFilters: IAttributeFilter[],
): SagaIterator<IAttributeFilter[]> {
    // only dashboard filters are subject to widget ignores
    const resolvedDashboardFilters: SagaReturnType<typeof getResolvedAttributeFilters> = yield call(
        getResolvedAttributeFilters,
        ctx,
        widget,
        dashboardAttributeFilters,
    );

    return [...resolvedDashboardFilters, ...insightAttributeFilters];
}

function* getResolvedAttributeFilters(
    ctx: DashboardContext,
    widget: FilterableDashboardWidget,
    attributeFilters: IAttributeFilter[],
): SagaIterator<IAttributeFilter[]> {
    const attributeFilterDisplayFormPairs: SagaReturnType<typeof loadDisplayFormsForAttributeFilters> =
        yield call(loadDisplayFormsForAttributeFilters, ctx, attributeFilters);
    const displayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> = yield select(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );

    const attributeFilterDisplayFormPairsWithIgnoreResolved = resolveWidgetFilterIgnore(
        widget,
        attributeFilterDisplayFormPairs,
        displayAsLabelMap,
    );

    return attributeFilterDisplayFormPairsWithIgnoreResolved.map((item) => item.filter);
}

function resolveWidgetFilterIgnore(
    widget: FilterableDashboardWidget,
    dashboardNonDateFilterDisplayFormPairs: IFilterDisplayFormPair[],
    displayAsLabelMap: Map<string, ObjRef>,
): IFilterDisplayFormPair[] {
    return dashboardNonDateFilterDisplayFormPairs.filter(({ filter, displayForm }) => {
        const matches =
            displayForm &&
            widget.ignoreDashboardFilters?.filter(isDashboardAttributeFilterReference).some((ignored) => {
                const filterLocalId = filterLocalIdentifier(filter);
                const displayAsLabel = filterLocalId ? displayAsLabelMap.get(filterLocalId) : undefined;
                return (
                    refMatchesMdObject(ignored.displayForm, displayForm, "displayForm") ||
                    areObjRefsEqual(ignored.displayForm, displayAsLabel)
                );
            });

        return !matches;
    });
}

function selectResolvedInsightDateFilters(
    widget: FilterableDashboardWidget,
    dashboardCommonDateFilters: IDateFilter[],
    dashboardDateFiltersWithDimensions: IDateFilter[],
    insightDateFilters: IDateFilter[],
    supportsMultipleDateFilters: boolean,
): IDateFilter[] {
    const nonIgnoredDashboardDateFilterDateDatasetPairs = selectResolveWidgetDateFilterIgnore(
        widget,
        dashboardCommonDateFilters,
        dashboardDateFiltersWithDimensions,
    );

    const insightDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(insightDateFilters);

    return resolveDateFilters(
        insightDateFilterDateDatasetPairs,
        nonIgnoredDashboardDateFilterDateDatasetPairs,
        supportsMultipleDateFilters,
    );
}

function selectResolveWidgetDateFilterIgnore(
    widget: FilterableDashboardWidget,
    dashboardCommonDateFilters: IDateFilter[],
    dashboardDateFiltersWithDimensions: IDateFilter[],
): IFilterDateDatasetPair[] {
    const commonDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(dashboardCommonDateFilters);

    const widgetDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(
        dashboardDateFiltersWithDimensions,
    );
    return resolveWidgetDateFilterIgnore(
        widget,
        commonDateFilterDateDatasetPairs,
        widgetDateFilterDateDatasetPairs,
    );
}

function resolveWidgetDateFilterIgnore(
    widget: FilterableDashboardWidget,
    commonDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
    widgetDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
): IFilterDateDatasetPair[] {
    const nonIgnoredCommonDateFilterDateDatasetPairs = commonDateFilterDateDatasetPairs.filter(
        ({ dateDatasetLink }) => {
            return (
                !!widget.dateDataSet &&
                dateDatasetLink &&
                areObjRefsEqual(widget.dateDataSet, dateDatasetLink)
            );
        },
    );
    const nonIgnoredWidgetDateFilterDateDatasetPairs = widgetDateFilterDateDatasetPairs.filter(
        ({ dateDatasetLink }) => {
            const matches = widget.ignoreDashboardFilters
                ?.filter(isDashboardDateFilterReference)
                .some((ignored) => dateDatasetLink && areObjRefsEqual(ignored.dataSet, dateDatasetLink));

            return !matches;
        },
    );
    return [...nonIgnoredCommonDateFilterDateDatasetPairs, ...nonIgnoredWidgetDateFilterDateDatasetPairs];
}

function selectResolvedDateFilters(
    widget: FilterableDashboardWidget,
    dashboardCommonDateFilters: IDateFilter[],
    dashboardDateFiltersWithDimensions: IDateFilter[],
    supportsMultipleDateFilters: boolean,
): IDateFilter[] {
    const allDateFilterDateDatasetPairs = selectResolveWidgetDateFilterIgnore(
        widget,
        dashboardCommonDateFilters,
        dashboardDateFiltersWithDimensions,
    );
    return resolveDateFilters([], allDateFilterDateDatasetPairs, supportsMultipleDateFilters);
}

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

function* queryWithInsight(
    ctx: DashboardContext,
    widget: FilterableDashboardWidget,
    insight: IInsightDefinition,
): SagaIterator<IFilter[]> {
    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const [widgetAwareDashboardCommonDateFilters, widgetAwareDashboardOtherFilters]: ReturnType<
        typeof widgetAwareDashboardFiltersSelector
    > = yield select(widgetAwareDashboardFiltersSelector);

    const supportsMultipleDateFilters = yield select(selectSupportsMultipleDateFilters);
    const enableDateFilterIdentifiers = yield select(selectEnableDateFilterIdentifiers);

    // add all time filter explicitly in case the date widgetAwareDashboardFilters are empty
    // this will cause the all time filter to be used instead of the insight date filter
    // if the dashboard date filter is not ignored by the widget
    if (!widgetAwareDashboardCommonDateFilters.length && widget.dateDataSet) {
        widgetAwareDashboardCommonDateFilters.push(
            newAllTimeFilter(
                widget.dateDataSet,
                enableDateFilterIdentifiers
                    ? generateDateFilterLocalIdentifier(0, widget.dateDataSet)
                    : undefined,
            ),
        );
    }

    const effectiveInsightFilters = insightFilters(insight);

    const [dateFilters, attributeFilters] = yield all([
        call(
            selectResolvedInsightDateFilters,
            widget,
            widgetAwareDashboardCommonDateFilters.filter(isDateFilter),
            widgetAwareDashboardOtherFilters.filter(isDateFilter),
            effectiveInsightFilters.filter(isDateFilter),
            supportsMultipleDateFilters,
        ),
        call(
            getResolvedInsightAttributeFilters,
            ctx,
            widget,
            widgetAwareDashboardOtherFilters.filter(isAttributeFilter),
            effectiveInsightFilters.filter(isAttributeFilter),
        ),
    ]);

    return [
        ...dateFilters,
        ...attributeFilters,
        /**
         * Strictly speaking, there should be a resolution here that makes sure there is at most one MVF per measure.
         * This, however, is not worth the hassle: AD will not allow creating such insight, so the only way this might
         * happen is if widgetFilterOverrides have this clash (or someone created an insight manually using API directly).
         *
         * We choose to not do it here as doing it would need extension of the SPI with some getMeasures method
         * (because the catalog API cannot be used here as we do not know which dataset the given measure might come from)
         * and we do not want that extension at the moment (catalog API should still be good enough for most use cases).
         */
        ...effectiveInsightFilters.filter(isMeasureValueFilter),
        // nothing to resolve for ranking filters
        ...effectiveInsightFilters.filter(isRankingFilter),
    ];
}

function* queryWithoutInsight(
    ctx: DashboardContext,
    widget: IKpiWidget | ICustomWidget | IRichTextWidget | IVisualizationSwitcherWidget,
): SagaIterator<IFilter[]> {
    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const [widgetAwareDashboardCommonDateFilters, widgetAwareDashboardOtherFilters]: ReturnType<
        typeof widgetAwareDashboardFiltersSelector
    > = yield select(widgetAwareDashboardFiltersSelector);

    const supportsMultipleDateFilters = yield select(selectSupportsMultipleDateFilters);

    const [dateFilters, attributeFilters] = yield all([
        call(
            selectResolvedDateFilters,
            widget,
            widgetAwareDashboardCommonDateFilters.filter(isDateFilter),
            widgetAwareDashboardOtherFilters.filter(isDateFilter),
            supportsMultipleDateFilters,
        ),
        call(
            getResolvedAttributeFilters,
            ctx,
            widget,
            widgetAwareDashboardOtherFilters.filter(isAttributeFilter),
        ),
    ]);

    return [...dateFilters, ...attributeFilters];
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
            return yield call(queryWithoutInsight, ctx, widget);
        }
    }
}
