// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import {
    areObjRefsEqual,
    filterObjRef,
    idRef,
    IInsight,
    insightFilters,
    insightRef,
    isDateFilter,
    ObjRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { call, SagaReturnType, select } from "redux-saga/effects";
import { createCachedQueryService } from "../state/_infra/queryService";
import { PromiseFnReturnType } from "../types/sagas";
import {
    InsightAttributesMeta,
    InsightDateDatasets,
    queryInsightAttributesMeta,
    QueryInsightDateDatasets,
} from "../queries";
import { selectObjectAvailabilityConfig } from "../state/config/configSelectors";
import { selectInsightByRef } from "../state/insights/insightsSelectors";
import { invalidQueryArguments } from "../events/general";
import { ICatalogDateDataset, isCatalogDateDataset } from "@gooddata/sdk-backend-spi";
import { query } from "../state/_infra/queryCall";
import { invariant } from "ts-invariant";
import { selectCatalogDateDatasets } from "../state/catalog/catalogSelectors";
import uniqBy from "lodash/uniqBy";
import fromPairs from "lodash/fromPairs";
import { newDisplayFormMap } from "../state/_infra/objRefMap";

export const QueryDateDatasetsForInsightService = createCachedQueryService(
    "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
    queryService,
    (query: QueryInsightDateDatasets) => serializeObjRef(query.payload.insightRef),
);

/**
 * Selector that will return date datasets for insight. The input to the selector is the dashboard query that is used
 * to obtain and cache the data.
 *
 * This selector will return undefined if the query to obtain the data for particular insight was not yet fired or
 * processed. Otherwise will return object containing `status` of the data retrieval; if the `status` is
 * `'success'` then the `result` prop will contain the data.
 *
 * @remarks see {@link QueryInsightDateDatasets}
 * @internal
 */
export const selectDateDatasetsForInsight = QueryDateDatasetsForInsightService.cache.selectQueryResult;

//
// Query implementation
//

const relevanceComparator = (a: ICatalogDateDataset, b: ICatalogDateDataset) => b.relevance - a.relevance; // descending sort

const titleComparatorFactory = (mapping: Record<string, string>) => {
    return (a: ICatalogDateDataset, b: ICatalogDateDataset) => {
        return mapping[a.dataSet.title].localeCompare(mapping[b.dataSet.title]);
    };
};

function sortByRelevanceAndTitle(dateDatasets: ICatalogDateDataset[], titleMapping: Record<string, string>) {
    const titleComparator = titleComparatorFactory(titleMapping);

    return dateDatasets.slice().sort((a, b) => {
        if (a.relevance === b.relevance) {
            return titleComparator(a, b);
        }
        return relevanceComparator(a, b);
    });
}

function sanitizeDateDatasetTitle(dataset: ICatalogDateDataset): string {
    return dataset.dataSet.title.trim().replace(/^Date \((.*)\)$/, "$1");
}

//
//
//

function* loadDateDatasetsForInsight(ctx: DashboardContext, insight: IInsight) {
    const { backend, workspace } = ctx;
    const availability: ReturnType<typeof selectObjectAvailabilityConfig> = yield select(
        selectObjectAvailabilityConfig,
    );

    /*
     * This is a little hack that relies on current catalog caching layer. Whole catalog is loaded at dashboard
     * load time and thus will be cached by the backend decorator.
     *
     * TODO: improve catalog caching to be granular on type level or at least have cache for the whole catalog &
     *  then for sub-types. if whole-catalog cache is available and another request to load catalog with just a subset
     *  of types is done, caching layer can satisfy everything from memory.
     */
    const catalogLoader = backend.workspace(workspace).catalog().load;
    const catalog: PromiseFnReturnType<typeof catalogLoader> = yield call(catalogLoader);

    /*
     * You may remember from KD that the code to get available date datasets was also calculating the
     * `attributesMap` before calling load date datasets.
     *
     * The fun part about that whole thing is, that the attributeMap was useless in that context: it was calculated,
     * but never used when loading available date datasets.
     *
     * That is because a loaded catalog already contains the attribute map as an implementation detail for the
     * bear backend and services (correctly) do not allow passing attributes map on the SPI.
     * The mapping is created at bear catalog load time and includes all attributes and display forms in it.
     *
     * Now.. the catalog used by KD (and in this here component) is the 'production' catalog that does not include any
     * custom, non-production datasets. Then.. you may ask.. how come KD worked when adding insights created on top
     * of non-production datasets? Well as it turns out.. when the low-level code dealing with availability finds
     * that it is missing some df -> attribute mapping it will obtain the necessary data to construct the mapping
     * via API calls.
     */
    const availableDateDataSetsLoader = catalog.availableItems().withOptions({
        types: ["dateDataset"],
        insight: insight,
        excludeTags: (availability.excludeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        includeTags: (availability.includeObjectsWithTags ?? []).map((tag) => idRef(tag)),
    }).load;

    const loadedAvailableDateDataSets: PromiseFnReturnType<typeof availableDateDataSetsLoader> = yield call(
        availableDateDataSetsLoader,
    );

    /*
     * You may also remember from KD that the code was cleaning up the relevance values from the available date
     * datasets. This was there to carefully align data to get feasible results from the `getRecommendedDateDataset`
     */
    return loadedAvailableDateDataSets.availableDateDatasets();
}

/**
 * Given insight and a list of available cataloged date datasets, this function looks up date datasets that are used
 * in insight's global date filters. Date datasets
 *
 * @param insight - insight to lookup date dataset for
 * @param datasets - all cataloged date datasets
 */
function lookupDatasetsUsedInDateFilters(
    insight: IInsight,
    datasets: ICatalogDateDataset[],
): ReadonlyArray<ICatalogDateDataset> {
    const dateFilters = insightFilters(insight).filter(isDateFilter);

    return dateFilters.map((filter) => {
        const datasetRef = filterObjRef(filter);
        const dateDataset = datasets.find((dataset) => areObjRefsEqual(datasetRef, dataset.dataSet.ref));

        // if this happens then either component is using wrong catalog or metadata is inconsistent (and insight thus un-renderable)
        invariant(dateDataset, `cannot find metadata for date dataset ${objRefToString(datasetRef)}`);

        return dateDataset;
    });
}

/**
 * Given insight and list of available cataloged date datasets, this generator will first query usage & metadata about
 * used display forms and attributes. With this, the function will lookup date datasets for each display form
 * used in insight's attribute buckets and attribute filters.
 *
 * Note: that cataloged date datasets already contain mapping of dataset -> attribute -> default display form. However
 * this cannot be used because the code cannot expect that the insights only use date dataset's default display forms.
 *
 * @param insight - insight work with
 * @param datasets - cataloged date datasets
 */
function* lookupDatasetsUsedInAttributesAndFilters(insight: IInsight, datasets: ICatalogDateDataset[]) {
    const insightAttributes: InsightAttributesMeta = yield call(
        query,
        queryInsightAttributesMeta(insightRef(insight)),
    );
    const {
        usage: { inAttributes, inFilters },
        displayForms,
    } = insightAttributes;

    const displayFormsMap = newDisplayFormMap(displayForms, false);

    const datasetLookup: (ref: ObjRef) => ICatalogDateDataset | undefined = (ref) => {
        const displayForm = displayFormsMap.get(ref);

        // if this bombs then the query insight attributes is messed up as it does not include display forms meta
        // for some display form used in the insight
        invariant(displayForm);

        const attributeRef = displayForm.attribute;
        return datasets.find((dataset) => {
            return dataset.dateAttributes.find((attribute) => {
                return areObjRefsEqual(attribute.attribute.ref, attributeRef);
            });
        });
    };

    return {
        usedInAttributes: inAttributes.map(datasetLookup),
        usedInAttributeFilters: inFilters.map(datasetLookup),
    };
}

function* lookupDatasetsInInsight(insight: IInsight) {
    /*
     * TODO: need to investigate whether the catalogDateDatasets are needed here. the theory is, loading available
     *  date datasets using catalog _likely_ gives everything this code should ever need. The query processor
     *  does the call to load available date datasets first.. so then instead of selecting the whole catalog from
     *  state this generator could receive date datasets as an argument. Note that KD used to get all date datasets
     *  from catalog so this matches the previous behavior.
     */

    const catalogDateDatasets: ReturnType<typeof selectCatalogDateDatasets> = yield select(
        selectCatalogDateDatasets,
    );

    const usedInDateFilters = lookupDatasetsUsedInDateFilters(insight, catalogDateDatasets);
    const usedInAttributesAndFilters: SagaReturnType<typeof lookupDatasetsUsedInAttributesAndFilters> =
        yield call(lookupDatasetsUsedInAttributesAndFilters, insight, catalogDateDatasets);
    const { usedInAttributes, usedInAttributeFilters } = usedInAttributesAndFilters;

    return {
        usedInDateFilters,
        usedInAttributes,
        usedInAttributeFilters,
    };
}

function* queryService(
    ctx: DashboardContext,
    query: QueryInsightDateDatasets,
): SagaIterator<InsightDateDatasets> {
    const {
        payload: { insightRef },
        correlationId,
    } = query;
    const insightSelector = selectInsightByRef(insightRef);
    const insight: ReturnType<typeof insightSelector> = yield select(insightSelector);

    if (!insight) {
        throw invalidQueryArguments(
            ctx,
            `Insight with ref ${objRefToString(insightRef)} does not exist on the dashboard`,
            correlationId,
        );
    }

    /*
     * first use the catalog's availability APIs to obtain date datasets relevant for this insight from the
     * backend
     */
    const dateDatasets: PromiseFnReturnType<typeof loadDateDatasetsForInsight> = yield call(
        loadDateDatasetsForInsight,
        ctx,
        insight,
    );

    /*
     * then inspect the insight itself and get categorized information about the usage of date datasets by
     * the insight itself.
     */
    const usedInInsight: SagaReturnType<typeof lookupDatasetsInInsight> = yield call(
        lookupDatasetsInInsight,
        insight,
    );
    const { usedInDateFilters, usedInAttributes, usedInAttributeFilters } = usedInInsight;

    const mostImportantFromInsight: ICatalogDateDataset =
        usedInDateFilters[0] ?? usedInAttributes[0] ?? usedInAttributeFilters[0];

    const dateDatasetDisplayNames = fromPairs(
        uniqBy(
            [...dateDatasets, ...usedInDateFilters, ...usedInAttributes, ...usedInAttributeFilters].filter(
                isCatalogDateDataset,
            ),
            (d) => serializeObjRef(d.dataSet.ref),
        ).map((d) => [d.dataSet.title, sanitizeDateDatasetTitle(d)]),
    );

    const result: InsightDateDatasets = {
        dateDatasets,
        dateDatasetsOrdered: sortByRelevanceAndTitle(dateDatasets, dateDatasetDisplayNames),
        usedInDateFilters,
        usedInAttributes,
        usedInAttributeFilters,
        dateDatasetDisplayNames,
        mostImportantFromInsight,
    };

    return result;
}
