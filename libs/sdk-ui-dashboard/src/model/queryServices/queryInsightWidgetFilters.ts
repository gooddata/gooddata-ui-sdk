// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { all, call, select } from "redux-saga/effects";
import { createQueryService } from "../state/_infra/queryService";
import {
    areObjRefsEqual,
    filterObjRef,
    IDateFilter,
    idRef,
    IFilter,
    IInsight,
    insightFilters,
    isAllTimeDateFilter,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isRankingFilter,
    ObjectType,
    ObjRef,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";
import { QueryInsightWidgetFilters } from "../queries/widgets";
import { selectWidgetByRef } from "../state/layout/layoutSelectors";
import { selectInsightByRef } from "../state/insights/insightsSelectors";
import { invalidQueryArguments } from "../events/general";
import {
    ICatalogDateDataset,
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

export const QueryInsightWidgetFiltersService = createQueryService(
    "GDC.DASH/QUERY.INSIGHT_WIDGET.FILTERS",
    queryService,
);

function loadDisplayFormsMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<IAttributeDisplayFormMetadataObject[]> {
    return ctx.backend.workspace(ctx.workspace).attributes().getAttributeDisplayForms(refs);
}

async function loadDateDatasetsMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<(ICatalogDateDataset | undefined)[]> {
    const catalog = await ctx.backend.workspace(ctx.workspace).catalog().forTypes(["dateDataset"]).load();
    const datasets = catalog.dateDatasets();

    return refs.map((ref) => datasets.find((dataset) => refMatchesMdObject(ref, dataset.dataSet, "dataSet")));
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
async function loadDisplayFormsForNonDateFilters(
    ctx: DashboardContext,
    filters: Exclude<IFilter, IDateFilter>[],
): Promise<IFilterDisplayFormPair[]> {
    const refs = filters.map(filterObjRef);

    const mdObjects = await loadDisplayFormsMetadata(ctx, compact(refs));

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

// TODO this could try to use the catalog for most of the items to speed things up
async function loadDateDatasetsForDateFilters(
    ctx: DashboardContext,
    filters: IDateFilter[],
): Promise<IFilterDateDatasetPair[]> {
    const refs = filters.map(filterObjRef);

    const mdObjects = await loadDateDatasetsMetadata(ctx, compact(refs));

    let mdObjectPointer = 0;
    let filterPointer = 0;

    const result: IFilterDateDatasetPair[] = [];

    while (filterPointer < filters.length) {
        const filter = filters[filterPointer];
        const hasObjRef = !!filterObjRef(filter);

        if (hasObjRef) {
            result.push({
                dateDataset: mdObjects[mdObjectPointer],
                filter,
            });
            mdObjectPointer++;
        } else {
            result.push({
                dateDataset: undefined,
                filter,
            });
        }
        filterPointer++;
    }

    return result;
}

function refMatchesMdObject(ref: ObjRef, mdObject: IMetadataObject, type?: ObjectType): boolean {
    return (
        areObjRefsEqual(ref, mdObject.ref) ||
        areObjRefsEqual(ref, idRef(mdObject.id, type)) ||
        areObjRefsEqual(ref, uriRef(mdObject.uri))
    );
}

async function getResolvedInsightNonDateFilters(
    ctx: DashboardContext,
    widget: IWidget,
    dashboardNonDateFilters: Exclude<IFilter, IDateFilter>[],
    insightNonDateFilters: Exclude<IFilter, IDateFilter>[],
): Promise<Exclude<IFilter, IDateFilter>[]> {
    const allNonDateFilters = [...insightNonDateFilters, ...dashboardNonDateFilters];

    const allNonDateFilterDisplayFormPairs = await loadDisplayFormsForNonDateFilters(ctx, allNonDateFilters);

    const insightFilterDisplayFormPairs = allNonDateFilterDisplayFormPairs.slice(
        0,
        insightNonDateFilters.length,
    );
    const dashboardFilterDisplayFormPairs = allNonDateFilterDisplayFormPairs.slice(
        insightNonDateFilters.length,
    );

    const dashboardFilterDisplayFormPairsWithIgnoreResolved = dashboardFilterDisplayFormPairs.filter(
        ({ displayForm }) => {
            const matches =
                displayForm &&
                widget.ignoreDashboardFilters
                    .filter(isDashboardAttributeFilterReference)
                    .some((ignored) => refMatchesMdObject(ignored.displayForm, displayForm, "displayForm"));

            return !matches;
        },
    );

    const nonIgnoredFilterPairs = [
        ...insightFilterDisplayFormPairs,
        ...dashboardFilterDisplayFormPairsWithIgnoreResolved,
    ];

    // resolve attribute filters - simple concat
    const resolvedAttributeFilters = nonIgnoredFilterPairs
        .filter(isAttributeFilter)
        .map((item) => item.filter);

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

async function getResolvedInsightDateFilters(
    ctx: DashboardContext,
    _widget: IWidget,
    _insight: IInsight,
    dashboardDateFilters: IDateFilter[],
    insightDateFilters: IDateFilter[],
): Promise<IDateFilter[]> {
    // TODO implicit all time filter
    const allDateFilters = [...insightDateFilters, ...dashboardDateFilters];
    const allDateFilterDateDatasetPairs = await loadDateDatasetsForDateFilters(ctx, allDateFilters);

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

function* queryService(ctx: DashboardContext, query: QueryInsightWidgetFilters): SagaIterator<IFilter[]> {
    const {
        payload: { widgetRef },
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

    if (!isInsightWidget(widget)) {
        throw invalidQueryArguments(
            ctx,
            `Widget with ref: ${objRefToString(widgetRef)} exists but is not an insight widget.`,
            correlationId,
        );
    }

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
    const [insightDateFilters, insightNonDateFilters] = partition(insightFilters(insight), isDateFilter);
    const [dashboardDateFilters, dashboardNonDateFilters] = partition(
        widgetAwareDashboardFilters,
        isDateFilter,
    );

    const [dateFilters, nonDateFilters] = yield all([
        call(getResolvedInsightDateFilters, ctx, widget, insight, dashboardDateFilters, insightDateFilters),
        call(getResolvedInsightNonDateFilters, ctx, widget, dashboardNonDateFilters, insightNonDateFilters),
    ]);

    return [...dateFilters, ...nonDateFilters];
}
