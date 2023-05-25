// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../types/commonTypes.js";
import { idRef, IInsightDefinition, ICatalogDateDataset } from "@gooddata/sdk-model";
import { selectObjectAvailabilityConfig } from "../store/config/configSelectors.js";
import { call, select } from "redux-saga/effects";
import { PromiseFnReturnType } from "../types/sagas.js";
import { SagaIterator } from "redux-saga";

/**
 * This generator function will communicate with backend to obtain the available date data sets that can be
 * used for date-filtering of the provided insight.
 *
 * The available date datasets vary based on the contents (measures, attributes) of the insight & the shape of
 * the LDM itself. Some data sets will not be available as they are unreachable given the measures/attributes
 * used in the insight.
 *
 * This generator will take into account the current object availability config.
 *
 * @param ctx - dashboard context in which the resolution should be done
 * @param insight - insight to use during availability check
 */
export function* loadDateDatasetsForInsight(
    ctx: DashboardContext,
    insight: IInsightDefinition,
): SagaIterator<ICatalogDateDataset[]> {
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
    const catalogLoader = backend.workspace(workspace).catalog();
    const catalog: PromiseFnReturnType<typeof catalogLoader.load> = yield call([
        catalogLoader,
        catalogLoader.load,
    ]);

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
    });

    const loadedAvailableDateDataSets: PromiseFnReturnType<typeof availableDateDataSetsLoader.load> =
        yield call([availableDateDataSetsLoader, availableDateDataSetsLoader.load]);

    /*
     * You may also remember from KD that the code was cleaning up the relevance values from the available date
     * datasets. This was there to carefully align data to get feasible results from the `getRecommendedDateDataset`
     */
    return loadedAvailableDateDataSets.availableDateDatasets();
}
