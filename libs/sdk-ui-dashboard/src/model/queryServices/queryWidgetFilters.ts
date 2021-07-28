// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";
import { all, call, SagaReturnType, select } from "redux-saga/effects";
import { createQueryService } from "../state/_infra/queryService";
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
    ObjectType,
    ObjRef,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";
import { QueryWidgetFilters } from "../queries/widgets";
import { selectAllFiltersForWidgetByRef, selectWidgetByRef } from "../state/layout/layoutSelectors";
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
import compact from "lodash/compact";
import zip from "lodash/zip";
import {
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
} from "../state/catalog/catalogSelectors";
import { PromiseFnReturnType } from "../types/sagas";

export const QueryWidgetFiltersService = createQueryService("GDC.DASH/QUERY.WIDGET.FILTERS", queryService);

function refMatchesMdObject(ref: ObjRef, mdObject: IMetadataObject, type?: ObjectType): boolean {
    return (
        areObjRefsEqual(ref, mdObject.ref) ||
        areObjRefsEqual(ref, idRef(mdObject.id, type)) ||
        areObjRefsEqual(ref, uriRef(mdObject.uri))
    );
}

async function loadDisplayFormsMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): Promise<IAttributeDisplayFormMetadataObject[]> {
    if (!refs.length) {
        return [];
    }

    return ctx.backend.workspace(ctx.workspace).attributes().getAttributeDisplayForms(refs);
}

function* getOrLoadDisplayFormsMetadata(
    ctx: DashboardContext,
    refs: ObjRef[],
): SagaIterator<IAttributeDisplayFormMetadataObject[]> {
    // first try getting as much as possible from catalog, there is a good chance the data is already there
    const catalogDisplayForms: ReturnType<typeof selectCatalogAttributeDisplayForms> = yield select(
        selectCatalogAttributeDisplayForms,
    );

    // for any ref not in catalog, load it from server (probably something from non-production dataset)
    const refsMissing = refs.filter(
        (ref) =>
            !catalogDisplayForms.some((displayForm) => refMatchesMdObject(ref, displayForm, "displayForm")),
    );

    const dataForMissingRefs: PromiseFnReturnType<typeof loadDisplayFormsMetadata> = yield call(
        loadDisplayFormsMetadata,
        ctx,
        refsMissing,
    );

    const allDisplayForms = [...catalogDisplayForms, ...dataForMissingRefs];

    return refs.map((ref): IAttributeDisplayFormMetadataObject => {
        const match = allDisplayForms.find((displayForm) =>
            refMatchesMdObject(ref, displayForm, "displayForm"),
        );
        // if this bombs the logic above is broken
        invariant(match);

        return match;
    });
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

    const mdObjects: SagaReturnType<typeof getOrLoadDisplayFormsMetadata> = yield call(
        getOrLoadDisplayFormsMetadata,
        ctx,
        compact(refs),
    );

    return zip(filters, mdObjects).map(([filter, displayForm]) => ({
        filter: filter!,
        displayForm: displayForm!,
    }));
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
    widget: IWidget,
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

function* getResolvedInsightDateFilters(
    insight: IInsight,
    dashboardDateFilters: IDateFilter[],
    insightDateFilters: IDateFilter[],
): SagaIterator<IDateFilter[]> {
    if (isDateFilterIgnoredForInsight(insight)) {
        return insightDateFilters;
    }

    const allDateFilters = [...insightDateFilters, ...dashboardDateFilters];
    const allDateFilterDateDatasetPairs: SagaReturnType<typeof getDateDatasetsForDateFilters> = yield call(
        getDateDatasetsForDateFilters,
        allDateFilters,
    );

    return resolveDateFilters(allDateFilterDateDatasetPairs);
}

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

    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const widgetAwareDashboardFilters: ReturnType<typeof widgetAwareDashboardFiltersSelector> = yield select(
        widgetAwareDashboardFiltersSelector,
    );

    // use the widgetFilterOverrides if specified instead of insight filters
    const effectiveInsightFilters = widgetFilterOverrides ?? insightFilters(insight);

    const [dateFilters, attributeFilters] = yield all([
        call(
            getResolvedInsightDateFilters,
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

function* queryForKpiWidget(
    ctx: DashboardContext,
    widget: IKpiWidget,
    widgetFilterOverrides: IFilter[] | undefined,
): SagaIterator<IFilter[]> {
    const widgetAwareDashboardFiltersSelector = selectAllFiltersForWidgetByRef(widget.ref);
    const widgetAwareDashboardFilters: ReturnType<typeof widgetAwareDashboardFiltersSelector> = yield select(
        widgetAwareDashboardFiltersSelector,
    );

    // use the widgetFilterOverrides if specified instead of insight filters
    const effectiveDashboardFilters = widgetFilterOverrides ?? widgetAwareDashboardFilters;

    const [dateFilters, attributeFilters] = yield all([
        call(getResolvedKpiDateFilters, effectiveDashboardFilters.filter(isDateFilter)),
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
        return yield call(queryForKpiWidget, ctx, widget, widgetFilterOverrides);
    }
}
