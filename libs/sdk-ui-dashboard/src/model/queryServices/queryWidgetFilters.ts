// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { all, call, SagaReturnType, select } from "redux-saga/effects";
import { createQueryService } from "../state/_infra/queryService";
import {
    areObjRefsEqual,
    filterObjRef,
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
import { selectWidgetByRef } from "../state/layout/layoutSelectors";
import { selectInsightByRef } from "../state/insights/insightsSelectors";
import { invalidQueryArguments } from "../events/general";
import {
    ICatalogDateDataset,
    IInsightWidget,
    IKpiWidget,
    IMetadataObject,
    isDashboardAttributeFilterReference,
    isInsightWidget,
    IWidget,
} from "@gooddata/sdk-backend-spi";
import { IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-backend-spi";
import { selectFilterContextFilters } from "../state/filterContext/filterContextSelectors";
import { filterContextItemsToFiltersForWidget } from "../../converters";
import compact from "lodash/compact";
import groupBy from "lodash/groupBy";
import last from "lodash/last";
import partition from "lodash/partition";
import { selectCatalogDateDatasets } from "../state/catalog/catalogSelectors";

export const QueryWidgetFiltersService = createQueryService("GDC.DASH/QUERY.WIDGET.FILTERS", queryService);

function loadDisplayFormsMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<IAttributeDisplayFormMetadataObject[]> {
    return ctx.backend.workspace(ctx.workspace).attributes().getAttributeDisplayForms(refs);
}

interface IFilterDisplayFormPair {
    filter: Exclude<IFilter, IDateFilter>;
    displayForm: IAttributeDisplayFormMetadataObject | undefined;
}

interface IFilterDateDatasetPair {
    filter: IDateFilter;
    dateDataset: ICatalogDateDataset | undefined;
}

// TODO this could try to use the catalog for most of the items to speed things up
function* loadDisplayFormsForNonDateFilters(
    ctx: DashboardContext,
    filters: Exclude<IFilter, IDateFilter>[],
): SagaIterator<IFilterDisplayFormPair[]> {
    const refs = filters.map(filterObjRef);

    const mdObjects = yield call(loadDisplayFormsMetadata, ctx, compact(refs));

    let mdObjectPointer = 0;
    let filterPointer = 0;

    const result: IFilterDisplayFormPair[] = [];

    while (filterPointer < filters.length) {
        const filter = filters[filterPointer];
        const hasObjRef = !!filterObjRef(filter);

        if (hasObjRef) {
            result.push({
                displayForm: mdObjects[mdObjectPointer],
                filter,
            });
            mdObjectPointer++;
        } else {
            result.push({
                displayForm: undefined,
                filter,
            });
        }
        filterPointer++;
    }

    return result;
}

// TODO maybe turn this into a selector?
function* getDateDatasetsForDateFilters(filters: IDateFilter[]): SagaIterator<IFilterDateDatasetPair[]> {
    const fromCatalog: ReturnType<typeof selectCatalogDateDatasets> = yield select(selectCatalogDateDatasets);

    return filters.map((filter): IFilterDateDatasetPair => {
        const dateDataset = fromCatalog.find((dateDataset) =>
            refMatchesMdObject(filterObjRef(filter), dateDataset.dataSet, "dataSet"),
        );

        return {
            dateDataset,
            filter,
        };
    });
}

function refMatchesMdObject(ref: ObjRef, mdObject: IMetadataObject, type?: ObjectType): boolean {
    return (
        areObjRefsEqual(ref, mdObject.ref) ||
        areObjRefsEqual(ref, idRef(mdObject.id, type)) ||
        areObjRefsEqual(ref, uriRef(mdObject.uri))
    );
}

function* getResolvedInsightNonDateFilters(
    ctx: DashboardContext,
    widget: IWidget,
    dashboardNonDateFilters: Exclude<IFilter, IDateFilter>[],
    insightNonDateFilters: Exclude<IFilter, IDateFilter>[],
): SagaIterator<Exclude<IFilter, IDateFilter>[]> {
    const allNonDateFilters = [...insightNonDateFilters, ...dashboardNonDateFilters];

    const allNonDateFilterDisplayFormPairs: SagaReturnType<typeof loadDisplayFormsForNonDateFilters> =
        yield call(loadDisplayFormsForNonDateFilters, ctx, allNonDateFilters);

    const insightFilterDisplayFormPairs = allNonDateFilterDisplayFormPairs.slice(
        0,
        insightNonDateFilters.length,
    );
    const dashboardFilterDisplayFormPairs = allNonDateFilterDisplayFormPairs.slice(
        insightNonDateFilters.length,
    );

    const dashboardFilterDisplayFormPairsWithIgnoreResolved = resolveWidgetFilterIgnore(
        widget,
        dashboardFilterDisplayFormPairs,
    );

    const nonIgnoredFilterPairs = [
        ...insightFilterDisplayFormPairs,
        ...dashboardFilterDisplayFormPairsWithIgnoreResolved,
    ];

    return getResolvedNonDateFilters(nonIgnoredFilterPairs);
}

function* getResolvedKpiNonDateFilters(
    ctx: DashboardContext,
    widget: IWidget,
    dashboardNonDateFilters: Exclude<IFilter, IDateFilter>[],
): SagaIterator<Exclude<IFilter, IDateFilter>[]> {
    const dashboardNonDateFilterDisplayFormPairs: SagaReturnType<typeof loadDisplayFormsForNonDateFilters> =
        yield call(loadDisplayFormsForNonDateFilters, ctx, dashboardNonDateFilters);

    const dashboardFilterDisplayFormPairsWithIgnoreResolved = resolveWidgetFilterIgnore(
        widget,
        dashboardNonDateFilterDisplayFormPairs,
    );

    return getResolvedNonDateFilters(dashboardFilterDisplayFormPairsWithIgnoreResolved);
}

function getResolvedNonDateFilters(
    nonIgnoredFilterPairs: IFilterDisplayFormPair[],
): Exclude<IFilter, IDateFilter>[] {
    // resolve attribute filters - simple concat
    const resolvedAttributeFilters = nonIgnoredFilterPairs
        .map((item) => item.filter)
        .filter(isAttributeFilter);

    // resolve Measure Value Filters - make sure there is at most one per measure
    const measureValueFilterGroups = groupBy(
        nonIgnoredFilterPairs.filter(({ filter }) => isMeasureValueFilter(filter)),
        ({ displayForm }) => displayForm?.id,
    );

    const resolvedMeasureValueFilters = Object.values(measureValueFilterGroups).map(
        (filters) => last(filters)!.filter,
    );

    // resolve ranking filters - simple concat
    const resolvedRankingFilters = nonIgnoredFilterPairs.filter(isRankingFilter).map((item) => item.filter);

    return [...resolvedAttributeFilters, ...resolvedMeasureValueFilters, ...resolvedRankingFilters];
}

function resolveWidgetFilterIgnore(
    widget: IWidget,
    dashboardNonDateFilterDisplayFormPairs: IFilterDisplayFormPair[],
): IFilterDisplayFormPair[] {
    return dashboardNonDateFilterDisplayFormPairs.filter(({ displayForm }) => {
        const matches =
            displayForm &&
            widget.ignoreDashboardFilters
                .filter(isDashboardAttributeFilterReference)
                .some((ignored) => refMatchesMdObject(ignored.displayForm, displayForm, "displayForm"));

        return !matches;
    });
}

function hasDateFilterForDateDataset(filters: IFilter[], dateDataset: ObjRef): boolean {
    return filters.some((filter) => {
        if (!isDateFilter(filter)) {
            return false;
        }

        return areObjRefsEqual(filterObjRef(filter), dateDataset);
    });
}

function addImplicitAllTimeFilter(widget: IWidget, resolvedFilters: IDateFilter[]): IDateFilter[] {
    // if the widget is connected to a dateDataset and has no date filters for it in the context,
    // add an implicit All time filter for that dimension - this will cause the InsightView to ignore
    // any date filters on that dimension - this is how KPI dashboards behave
    if (widget.dateDataSet && !hasDateFilterForDateDataset(resolvedFilters, widget.dateDataSet)) {
        return [...resolvedFilters, newAllTimeFilter(widget.dateDataSet)];
    }
    return resolvedFilters;
}

/**
 * Tests whether dashboard's date filter should not be applied on the insight included in the provided widget.
 *
 * This should happen for insights whose simple measures are all already set up with date filters. I guess ignoring
 * global date filter is desired because otherwise there is a large chance that the intersection of global date filter
 * and measure's date filters would lead to empty set and no data shown for the insight?
 */
export function isDateFilterIgnoredForInsight(insight: IInsight): boolean {
    const simpleMeasures = insightMeasures(insight, isSimpleMeasure);

    if (simpleMeasures.length === 0) {
        return false;
    }

    const simpleMeasuresWithDateFilter = simpleMeasures.filter((m) =>
        (measureFilters(m) ?? []).some(isDateFilter),
    );

    return simpleMeasures.length === simpleMeasuresWithDateFilter.length;
}

// TODO maybe turn this into a selector?
function* getResolvedInsightDateFilters(
    widget: IWidget,
    insight: IInsight,
    dashboardDateFilters: IDateFilter[],
    insightDateFilters: IDateFilter[],
): SagaIterator<IDateFilter[]> {
    if (isDateFilterIgnoredForInsight(insight)) {
        return insightDateFilters;
    }

    const allDateFilters = addImplicitAllTimeFilter(widget, [...insightDateFilters, ...dashboardDateFilters]);
    const allDateFilterDateDatasetPairs: SagaReturnType<typeof getDateDatasetsForDateFilters> = yield call(
        getDateDatasetsForDateFilters,
        allDateFilters,
    );

    return resolveDateFilters(allDateFilterDateDatasetPairs);
}

// TODO maybe turn this into a selector?
function* getResolvedKpiDateFilters(dashboardDateFilters: IDateFilter[]): SagaIterator<IDateFilter[]> {
    const allDateFilterDateDatasetPairs: SagaReturnType<typeof getDateDatasetsForDateFilters> = yield call(
        getDateDatasetsForDateFilters,
        dashboardDateFilters,
    );

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

    // convert all the filter context items to "normal" filters
    const dashboardFilters: ReturnType<typeof selectFilterContextFilters> = yield select(
        selectFilterContextFilters,
    );
    const widgetAwareDashboardFilters = filterContextItemsToFiltersForWidget(dashboardFilters, widget);

    // resolve date filters and other filters separately as the logic there is quite different
    const [insightDateFilters, insightNonDateFilters] = partition(
        widgetFilterOverrides ?? insightFilters(insight), // use the widgetFilterOverrides if specified instead of insight filters
        isDateFilter,
    );
    const [dashboardDateFilters, dashboardNonDateFilters] = partition(
        widgetAwareDashboardFilters,
        isDateFilter,
    );

    const [dateFilters, nonDateFilters] = yield all([
        call(getResolvedInsightDateFilters, widget, insight, dashboardDateFilters, insightDateFilters),
        call(getResolvedInsightNonDateFilters, ctx, widget, dashboardNonDateFilters, insightNonDateFilters),
    ]);

    return [...dateFilters, ...nonDateFilters];
}

function* queryForKpiWidget(ctx: DashboardContext, widget: IKpiWidget): SagaIterator<IFilter[]> {
    // convert all the filter context items to "normal" filters
    const dashboardFilters = yield select(selectFilterContextFilters);
    const widgetAwareDashboardFilters = filterContextItemsToFiltersForWidget(dashboardFilters, widget);

    // resolve date filters and other filters separately as the logic there is quite different
    const [dashboardDateFilters, dashboardNonDateFilters] = partition(
        widgetAwareDashboardFilters,
        isDateFilter,
    );

    const [dateFilters, nonDateFilters] = yield all([
        call(getResolvedKpiDateFilters, dashboardDateFilters),
        call(getResolvedKpiNonDateFilters, ctx, widget, dashboardNonDateFilters),
    ]);

    return [...dateFilters, ...nonDateFilters];
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
        return yield call(queryForKpiWidget, ctx, widget);
    }
}
