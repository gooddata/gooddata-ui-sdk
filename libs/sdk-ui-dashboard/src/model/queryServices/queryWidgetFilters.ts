// (C) 2021-2024 GoodData Corporation
import { DashboardContext } from "../types/commonTypes.js";
import { SagaIterator } from "redux-saga";
import { all, call, SagaReturnType, select } from "redux-saga/effects";
import { createQueryService } from "../store/_infra/queryService.js";
import {
    areObjRefsEqual,
    filterObjRef,
    IAttributeFilter,
    IDateFilter,
    idRef,
    IFilter,
    IInsightDefinition,
    insightFilters,
    isAllTimeDateFilter,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isRankingFilter,
    newAllTimeFilter,
    ObjectType,
    ObjRef,
    objRefToString,
    uriRef,
    isDashboardAttributeFilterReference,
    IKpiWidget,
    ICatalogDateDataset,
    IAttributeDisplayFormMetadataObject,
    IMetadataObject,
    isInsightWidget,
    isDashboardDateFilterReference,
} from "@gooddata/sdk-model";
import { QueryWidgetFilters } from "../queries/widgets.js";
import { selectAllFiltersForWidgetByRef, selectWidgetByRef } from "../store/layout/layoutSelectors.js";
import { selectInsightByRef } from "../store/insights/insightsSelectors.js";
import { invalidQueryArguments } from "../events/general.js";
import compact from "lodash/compact.js";
import { selectAllCatalogDateDatasetsMap } from "../store/catalog/catalogSelectors.js";
import { DashboardState } from "../store/types.js";
import { resolveDisplayFormMetadata } from "../utils/displayFormResolver.js";
import { invariant } from "ts-invariant";
import isEmpty from "lodash/isEmpty.js";
import { ExtendedDashboardWidget, ICustomWidget } from "../types/layoutTypes.js";
import { selectSupportsMultipleDateFilters } from "../store/backendCapabilities/backendCapabilitiesSelectors.js";

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
    dateDataset: ICatalogDateDataset | undefined;
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

function selectDateDatasetsForDateFilters(
    state: DashboardState,
    filters: IDateFilter[],
): IFilterDateDatasetPair[] {
    const fromCatalog = selectAllCatalogDateDatasetsMap(state);

    return filters.map((filter): IFilterDateDatasetPair => {
        const dateDataset = fromCatalog.get(filterObjRef(filter));

        return {
            dateDataset,
            filter,
        };
    });
}

function* getResolvedInsightAttributeFilters(
    ctx: DashboardContext,
    widget: ExtendedDashboardWidget,
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
    widget: ExtendedDashboardWidget,
    attributeFilters: IAttributeFilter[],
): SagaIterator<IAttributeFilter[]> {
    const attributeFilterDisplayFormPairs: SagaReturnType<typeof loadDisplayFormsForAttributeFilters> =
        yield call(loadDisplayFormsForAttributeFilters, ctx, attributeFilters);

    const attributeFilterDisplayFormPairsWithIgnoreResolved = resolveWidgetFilterIgnore(
        widget,
        attributeFilterDisplayFormPairs,
    );

    return attributeFilterDisplayFormPairsWithIgnoreResolved.map((item) => item.filter);
}

function resolveWidgetFilterIgnore(
    widget: ExtendedDashboardWidget,
    dashboardNonDateFilterDisplayFormPairs: IFilterDisplayFormPair[],
): IFilterDisplayFormPair[] {
    return dashboardNonDateFilterDisplayFormPairs.filter(({ displayForm }) => {
        const matches =
            displayForm &&
            widget.ignoreDashboardFilters
                ?.filter(isDashboardAttributeFilterReference)
                .some((ignored) => refMatchesMdObject(ignored.displayForm, displayForm, "displayForm"));

        return !matches;
    });
}

function selectResolvedInsightDateFilters(
    state: DashboardState,
    widget: ExtendedDashboardWidget,
    dashboardCommonDateFilters: IDateFilter[],
    dashboardDateFiltersWithDimensions: IDateFilter[],
    insightDateFilters: IDateFilter[],
    supportsMultipleDateFilters: boolean,
): IDateFilter[] {
    const nonIgnoredDashboardDateFilterDateDatasetPairs = selectResolveWidgetDateFilterIgnore(
        state,
        widget,
        dashboardCommonDateFilters,
        dashboardDateFiltersWithDimensions,
    );

    const insightDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(state, insightDateFilters);

    return resolveDateFilters(
        insightDateFilterDateDatasetPairs,
        nonIgnoredDashboardDateFilterDateDatasetPairs,
        supportsMultipleDateFilters,
    );
}

function selectResolveWidgetDateFilterIgnore(
    state: DashboardState,
    widget: ExtendedDashboardWidget,
    dashboardCommonDateFilters: IDateFilter[],
    dashboardDateFiltersWithDimensions: IDateFilter[],
): IFilterDateDatasetPair[] {
    const commonDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(
        state,
        dashboardCommonDateFilters,
    );

    const widgetDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(
        state,
        dashboardDateFiltersWithDimensions,
    );
    return resolveWidgetDateFilterIgnore(
        widget,
        commonDateFilterDateDatasetPairs,
        widgetDateFilterDateDatasetPairs,
    );
}

function resolveWidgetDateFilterIgnore(
    widget: ExtendedDashboardWidget,
    commonDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
    widgetDateFilterDateDatasetPairs: IFilterDateDatasetPair[],
): IFilterDateDatasetPair[] {
    const nonIgnoredCommonDateFilterDateDatasetPairs = commonDateFilterDateDatasetPairs.filter(
        ({ dateDataset }) => {
            return (
                !!widget.dateDataSet &&
                dateDataset &&
                refMatchesMdObject(widget.dateDataSet, dateDataset.dataSet, "dataSet")
            );
        },
    );
    const nonIgnoredWidgetDateFilterDateDatasetPairs = widgetDateFilterDateDatasetPairs.filter(
        ({ dateDataset }) => {
            const matches =
                dateDataset &&
                widget.ignoreDashboardFilters
                    ?.filter(isDashboardDateFilterReference)
                    .some((ignored) => refMatchesMdObject(ignored.dataSet, dateDataset.dataSet, "dataSet"));

            return !matches;
        },
    );
    return [...nonIgnoredCommonDateFilterDateDatasetPairs, ...nonIgnoredWidgetDateFilterDateDatasetPairs];
}

function selectResolvedDateFilters(
    state: DashboardState,
    widget: ExtendedDashboardWidget,
    dashboardCommonDateFilters: IDateFilter[],
    dashboardDateFiltersWithDimensions: IDateFilter[],
    supportsMultipleDateFilters: boolean,
): IDateFilter[] {
    const allDateFilterDateDatasetPairs = selectResolveWidgetDateFilterIgnore(
        state,
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
        .filter((item) => !!item.dateDataset)
        .map((item) => item.filter);
    return insightDateFilterDateDatasetPairs
        .filter((item) => !!item.dateDataset)
        .reduceRight((acc: IDateFilter[], curr) => {
            const alreadyPresent = acc.some((item) =>
                refMatchesMdObject(filterObjRef(item), curr.dateDataset!.dataSet, "dataSet"),
            );

            if (!alreadyPresent) {
                acc.push(curr.filter);
            }

            return acc;
        }, init)
        .filter((item) => {
            if (!supportsMultipleDateFilters) {
                return !isAllTimeDateFilter(item);
            } else {
                return true;
            }
        });
}

function* queryWithInsight(
    ctx: DashboardContext,
    widget: ExtendedDashboardWidget,
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
        widgetAwareDashboardCommonDateFilters.push(newAllTimeFilter(widget.dateDataSet));
    }

    const effectiveInsightFilters = insightFilters(insight);

    const [dateFilters, attributeFilters] = yield all([
        select(
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
    widget: IKpiWidget | ICustomWidget,
): SagaIterator<IFilter[]> {
    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const [widgetAwareDashboardCommonDateFilters, widgetAwareDashboardOtherFilters]: ReturnType<
        typeof widgetAwareDashboardFiltersSelector
    > = yield select(widgetAwareDashboardFiltersSelector);

    const supportsMultipleDateFilters = yield select(selectSupportsMultipleDateFilters);

    const [dateFilters, attributeFilters] = yield all([
        select(
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

function* queryService(ctx: DashboardContext, query: QueryWidgetFilters): SagaIterator<IFilter[]> {
    const {
        payload: { widgetRef, insight },
        correlationId,
    } = query;
    const widgetSelector = selectWidgetByRef(widgetRef);
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
