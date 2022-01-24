// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { all, call, SagaReturnType, select } from "redux-saga/effects";
import { createQueryService } from "../store/_infra/queryService";
import {
    areObjRefsEqual,
    filterObjRef,
    IAttributeFilter,
    IDateFilter,
    idRef,
    IFilter,
    IInsight,
    insightFilters,
    insightMeasures,
    isAllTimeDateFilter,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isRankingFilter,
    isSimpleMeasure,
    measureFilters,
    newAllTimeFilter,
    ObjectType,
    ObjRef,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";
import { QueryWidgetFilters } from "../queries/widgets";
import { selectAllFiltersForWidgetByRef, selectWidgetByRef } from "../store/layout/layoutSelectors";
import { selectInsightByRef } from "../store/insights/insightsSelectors";
import { invalidQueryArguments } from "../events/general";
import {
    IAttributeDisplayFormMetadataObject,
    ICatalogDateDataset,
    IInsightWidget,
    IKpiWidget,
    IMetadataObject,
    isDashboardAttributeFilterReference,
    isInsightWidget,
    IWidget,
} from "@gooddata/sdk-backend-spi";
import compact from "lodash/compact";
import { selectAllCatalogDateDatasetsMap } from "../store/catalog/catalogSelectors";
import { DashboardState } from "../store/types";
import { resolveDisplayFormMetadata } from "../utils/displayFormResolver";
import invariant from "ts-invariant";
import isEmpty from "lodash/isEmpty";
import { ExtendedDashboardWidget, ICustomWidget } from "../types/layoutTypes";

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
    widget: IWidget,
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

/**
 * Tests whether dashboard's date filter should not be applied on the insight included in the provided widget.
 *
 * This should happen for insights whose simple measures are all already set up with date filters. I guess ignoring
 * global date filter is desired because otherwise there is a large chance that the intersection of global date filter
 * and measure's date filters would lead to empty set and no data shown for the insight?
 */
export function isDashboardDateFilterIgnoredForInsight(insight: IInsight): boolean {
    const simpleMeasures = insightMeasures(insight, isSimpleMeasure);
    return simpleMeasures.length > 0 && simpleMeasures.every((m) => measureFilters(m)?.some(isDateFilter));
}

function selectResolvedInsightDateFilters(
    state: DashboardState,
    insight: IInsight,
    dashboardDateFilters: IDateFilter[],
    insightDateFilters: IDateFilter[],
): IDateFilter[] {
    if (isDashboardDateFilterIgnoredForInsight(insight)) {
        return insightDateFilters;
    }

    const allDateFilters = [...insightDateFilters, ...dashboardDateFilters];
    const allDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(state, allDateFilters);

    return resolveDateFilters(allDateFilterDateDatasetPairs);
}

function selectResolvedDateFilters(
    state: DashboardState,
    dashboardDateFilters: IDateFilter[],
): IDateFilter[] {
    const allDateFilterDateDatasetPairs = selectDateDatasetsForDateFilters(state, dashboardDateFilters);

    return resolveDateFilters(allDateFilterDateDatasetPairs);
}

function resolveDateFilters(allDateFilterDateDatasetPairs: IFilterDateDatasetPair[]): IDateFilter[] {
    // go through the filters in reverse order using the first filter for a given dimension encountered
    // and strip useless all time filters at the end
    return allDateFilterDateDatasetPairs
        .filter((item) => !!item.dateDataset)
        .reduceRight((acc: IDateFilter[], curr) => {
            const alreadyPresent = acc.some((item) =>
                refMatchesMdObject(filterObjRef(item), curr.dateDataset!.dataSet, "dataSet"),
            );

            if (!alreadyPresent) {
                acc.push(curr.filter);
            }

            return acc;
        }, [])
        .filter((item) => !isAllTimeDateFilter(item));
}

function* queryForInsightWidget(
    ctx: DashboardContext,
    widget: IInsightWidget,
    widgetFilterOverrides: IFilter[] | undefined,
    correlationId: string | undefined,
): SagaIterator<IFilter[]> {
    const insightRef = widget.insight;
    const insightSelector = selectInsightByRef(insightRef);
    const insight: ReturnType<typeof insightSelector> = yield select(insightSelector);

    if (!insight) {
        throw invalidQueryArguments(
            ctx,
            `Insight with ref ${objRefToString(insightRef)} does not exist on the dashboard`,
            correlationId,
        );
    }

    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const widgetAwareDashboardFilters: ReturnType<typeof widgetAwareDashboardFiltersSelector> = yield select(
        widgetAwareDashboardFiltersSelector,
    );

    // add all time filter explicitly in case the date widgetAwareDashboardFilters are empty
    // this will cause the all time filter to be used instead of the insight date filter
    // if the dashboard date filter is not ignored by the widget
    if (!widgetAwareDashboardFilters.filter(isDateFilter).length && widget.dateDataSet) {
        widgetAwareDashboardFilters.push(newAllTimeFilter(widget.dateDataSet));
    }

    // use the widgetFilterOverrides if specified instead of insight filters
    const effectiveInsightFilters = widgetFilterOverrides ?? insightFilters(insight);

    const [dateFilters, attributeFilters] = yield all([
        select(
            selectResolvedInsightDateFilters,
            insight,
            widgetAwareDashboardFilters.filter(isDateFilter),
            effectiveInsightFilters.filter(isDateFilter),
        ),
        call(
            getResolvedInsightAttributeFilters,
            ctx,
            widget,
            widgetAwareDashboardFilters.filter(isAttributeFilter),
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

function* queryForKpiOrCustomWidget(
    ctx: DashboardContext,
    widget: IKpiWidget | ICustomWidget,
    widgetFilterOverrides: IFilter[] | undefined,
): SagaIterator<IFilter[]> {
    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const widgetAwareDashboardFilters: ReturnType<typeof widgetAwareDashboardFiltersSelector> = yield select(
        widgetAwareDashboardFiltersSelector,
    );

    // use the widgetFilterOverrides if specified instead of insight filters
    const effectiveDashboardFilters = widgetFilterOverrides ?? widgetAwareDashboardFilters;

    const [dateFilters, attributeFilters] = yield all([
        select(selectResolvedDateFilters, effectiveDashboardFilters.filter(isDateFilter)),
        call(getResolvedAttributeFilters, ctx, widget, effectiveDashboardFilters.filter(isAttributeFilter)),
    ]);

    return [...dateFilters, ...attributeFilters];
}

function* queryService(ctx: DashboardContext, query: QueryWidgetFilters): SagaIterator<IFilter[]> {
    const {
        payload: { widgetRef, widgetFilterOverrides },
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

    if (isInsightWidget(widget)) {
        return yield call(queryForInsightWidget, ctx, widget, widgetFilterOverrides, correlationId);
    } else {
        return yield call(queryForKpiOrCustomWidget, ctx, widget, widgetFilterOverrides);
    }
}
