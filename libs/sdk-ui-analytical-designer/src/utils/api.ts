// (C) 2007-2026 GoodData Corporation

import { compact, unionBy, uniqBy } from "lodash-es";

import {
    type IDashboardExportRawOptions,
    type IExportResult,
    type IInsightReferencing,
    type IMeasureOverride,
    type IRawExportCustomOverrides,
    type IUserSettings,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeElements,
    type IAttributeMetadataObject,
    type IAttributeOrMeasure,
    type ICatalogDateAttribute,
    type ICatalogDateDataset,
    type IColorPalette,
    type IComputedAttributeMetadataObject,
    type IExecutionDefinition,
    type IInsight,
    type IInsightDefinition,
    type IListedDashboard,
    type IVisualizationClass,
    type ObjRef,
    areObjRefsEqual,
    attributeDisplayFormRef,
    defFingerprint,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    getAttributeElementsItems,
    idRef,
    insightAttributeFilterConfigs,
    insightAttributes,
    insightFilters,
    insightHasDataDefined,
    insightMeasures,
    isAttributeElementsByRef,
    isAttributeFilterWithSelection,
    measureFilters,
    newDefForInsight,
    newDefForItems,
    objRefToString,
} from "@gooddata/sdk-model";
import { randomString } from "@gooddata/util";

import { backend } from "../backend.js";
import { bearLegacyFunctions } from "../bearLegacyFunctions.js";
import { type Granularity } from "../models/granularity.js";
import { isElementUrisSupported } from "../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { indexValidElements } from "../services/report_service.js";
import { getItemCacheState } from "../store/item_cache/item_cache_selectors.js";
import { type IAppState } from "../store/types.js";
import { type IAttributeValidElementsData } from "../typings/attribute_filters.js";
import { type IDateDataset, type IDateDatasets } from "../typings/datasets.js";
import { type ICatalogEntries, type ICatalogEntry } from "../typings/state_objects.js";

import { isSingleEmptyStringElement } from "./date_filter.js";
import { displayFormToCacheDisplayForm } from "./displayForms.js";
import { getRouteParams } from "./location.js";
import { mergeSortedAlphabeticallyByTitle } from "./merge_sorted_by_title.js";

export function setupSessionId(xhr: { setRequestHeader: (name: string, value: string) => void }, id: string) {
    xhr.setRequestHeader("X-GDC-REQUEST", id + randomString(10));
}

export function getMetricsEditorUrl(projectId: string, metricUri?: string, workspacesRef = "projects") {
    return metricUri
        ? `/#s=/gdc/${workspacesRef}/${projectId}|objectPage|${metricUri}`
        : `/#s=/gdc/${workspacesRef}/${projectId}|objectPage|none|metric`;
}

export const checkMetricOverrides = (
    workspaceId: string,
    identifiers: string[],
): Promise<IMeasureOverride[]> => backend.workspace(workspaceId).measures().checkEntityOverrides(identifiers);

export const exportRawToServer = async (
    definition: IExecutionDefinition,
    projectId: string,
    fileName: string,
    customOverrides: IRawExportCustomOverrides,
    options?: IDashboardExportRawOptions,
): Promise<IExportResult> => {
    return await backend
        .workspace(projectId)
        .dashboards()
        .exportDashboardToCSVRaw(definition, fileName, customOverrides, options);
};

export async function getUserProjectConfigs(projectId: string): Promise<IUserWorkspaceSettings> {
    return backend.workspace(projectId).settings().getSettingsForCurrentUser();
}

export async function getUserConfigs(): Promise<IUserSettings> {
    return backend.currentUser().settings().getSettings();
}

export async function getColorPalette(workspaceId: string): Promise<IColorPalette> {
    return backend.workspace(workspaceId).styling().getColorPalette();
}

export function getObjectIdFromUri(uri: string) {
    return uri.split("/").at(-1);
}

async function loadAttributeElementsSelectionForElements(
    projectId: string,
    dfRef: ObjRef,
    displayAsDfRef: ObjRef,
    elements: IAttributeElements,
): Promise<IAttributeElement[]> {
    if (isAttributeElementsByRef(elements)) {
        const result = await backend
            .workspace(projectId)
            .attributes()
            .elements()
            .forDisplayForm(dfRef)
            .withOptions({ elements })
            .withLimit(elements.uris.length)
            .query();

        return result.items;
    } else {
        const result = await backend
            .workspace(projectId)
            .attributes()
            .elements()
            .forDisplayForm(displayAsDfRef)
            .withOptions({
                elements,
                filterByPrimaryLabel: !areObjRefsEqual(dfRef, displayAsDfRef),
            })
            .withLimit(elements.values.length)
            .query();

        return result.items;
    }
}

async function loadAttributeElementsSelection(
    projectId: string,
    dfRef: ObjRef,
    displayAsDfRef: ObjRef,
    elements: IAttributeElements,
): Promise<{ items: IAttributeElement[]; total: number }> {
    // plain valid elements are needed for "totalElementsCount" which is used mainly in
    // negative filter selection count ("see metadata.ts -> processVisualizationAttributeFilter")
    const loaderWithLimit = backend
        .workspace(projectId)
        .attributes()
        .elements()
        .forDisplayForm(dfRef)
        .withLimit(545);

    const [limitResults, uriResults] = await Promise.all([
        loaderWithLimit.query(),
        loadAttributeElementsSelectionForElements(projectId, dfRef, displayAsDfRef, elements),
    ]);

    const union = unionBy(limitResults.items, uriResults, (element) => element.uri);

    return {
        items: union,
        total: limitResults.totalCount,
    };
}

export function exportReportToServer(projectId: string, insight: IInsight): Promise<string> {
    return bearLegacyFunctions.openAsReport(projectId, insight);
}

export async function loadVisualizationClasses(projectId: string): Promise<IVisualizationClass[]> {
    return backend.workspace(projectId).insights().getVisualizationClasses({ includeDeprecated: false });
}

async function getAttributeElementsNew(
    projectId: string,
    dfRef: ObjRef,
    displayAsDfRef: ObjRef,
    elements: IAttributeElements,
    loadAttributeElementsSelectionFn: typeof loadAttributeElementsSelection = loadAttributeElementsSelection,
) {
    return loadAttributeElementsSelectionFn(projectId, dfRef, displayAsDfRef, elements).then((result) => ({
        ...result,
        filterItemsRef: dfRef,
    }));
}

// TODO: remove and adapt others to use new format
function convertDateDatasetToLegacyForm(
    catalogDateDataset: ICatalogDateDataset,
    isAvailable = true,
): IDateDataset {
    return {
        ref: catalogDateDataset.dataSet.ref,
        title: catalogDateDataset.dataSet.title,
        summary: catalogDateDataset.dataSet.description,
        identifier: catalogDateDataset.dataSet.id,
        uri: catalogDateDataset.dataSet.uri,
        relevance: catalogDateDataset.relevance,
        type: catalogDateDataset.type,
        id: catalogDateDataset.dataSet.id, // TODO duplicate with identifier
        isAvailable,
        attributes: catalogDateDataset.dateAttributes.map((dateAttribute) => ({
            ref: dateAttribute.attribute.ref,
            granularity: dateAttribute.attribute.id, // TODO why not granularity?
            dfRef: dateAttribute.defaultDisplayForm.ref,
            dfIdentifier: dateAttribute.defaultDisplayForm.id,
            dfUri: dateAttribute.defaultDisplayForm.uri,
            dateType: dateAttribute.granularity as Granularity,
            uri: dateAttribute.attribute.uri,
            title: dateAttribute.attribute.title,
            displayForms: dateAttribute.attribute.displayForms.map(displayFormToCacheDisplayForm),
        })),
    };
}

function isDateDatasetItemAvailable(
    dateDataset: ICatalogDateDataset,
    availableDateDatasets: ICatalogDateDataset[],
) {
    return availableDateDatasets.some((item) => item.dataSet.id === dateDataset.dataSet.id);
}

/**
 * Checks if the filter has any elements that need to be loaded.
 * Returns false for empty filters (no elements selected).
 */
function hasElementsToLoad(elements: IAttributeElements): boolean {
    if (isAttributeElementsByRef(elements)) {
        return elements.uris.length > 0;
    }
    return elements.values.length > 0;
}

async function loadFilterElements(insight: IInsight, state: IAppState) {
    const projectId = getProjectId(state);
    const filtersConfigs = insightAttributeFilterConfigs(insight);
    const filtersFromInsight = insightFilters(insight);
    const measures = insightMeasures(insight);
    const filtersFromMeasures = measures.flatMap(measureFilters);
    const allFilters = [...filtersFromInsight, ...filtersFromMeasures];
    const attributeFilters = allFilters.filter(isAttributeFilterWithSelection);
    const allFilterConfigs = attributeFilters.flatMap((f) => {
        const filterDisplayFormRef = filterObjRef(f);
        const elements = filterAttributeElements(f);
        const filterConfig = filtersConfigs?.[filterLocalIdentifier(f)];
        const displayAsLabel = filterConfig?.displayAsLabel;
        return {
            dfRef: filterDisplayFormRef,
            displayAsLabelRef: displayAsLabel || filterDisplayFormRef,
            elements,
        };
    });

    const elementPromises = allFilterConfigs
        .filter(
            (fc) =>
                hasElementsToLoad(fc.elements) &&
                !isSingleEmptyStringElement(getAttributeElementsItems(fc.elements)),
        )
        .map(({ dfRef, displayAsLabelRef, elements }) =>
            getAttributeElementsNew(projectId, dfRef, displayAsLabelRef, elements, undefined),
        );

    const validElements = await Promise.all(elementPromises);
    return indexValidElements(validElements);
}

async function fetchDateDatasets(
    projectId: string,
    options: ILoadDateDatasetsOptions = {},
): Promise<{
    allDateDatasets: ICatalogDateDataset[];
    availableDateDatasets: ICatalogDateDataset[];
}> {
    const loader = backend
        .workspace(projectId)
        .catalog()
        .withOptions({
            types: ["dateDataset"],
            excludeTags: options.excludeObjectsWithTags ?? [],
            includeTags: options.includeObjectsWithTags ?? [],
            dataset: options.dataSetIdentifier,
            production: options.production,
            includeDateGranularities: [
                "GDC.time.day_in_week",
                "GDC.time.day_in_month",
                "GDC.time.day_in_quarter",
                "GDC.time.day_in_year",
                "GDC.time.week_in_quarter",
                "GDC.time.week_in_year",
                "GDC.time.month_in_quarter",
                "GDC.time.month_in_year",
                "GDC.time.quarter_in_year",
                "GDC.time.fiscal_year",
                "GDC.time.fiscal_quarter",
                "GDC.time.fiscal_month",
            ],
        });

    const catalog = await loader.load();

    const isInsightNonEmpty = options.insight && insightHasDataDefined(options.insight);
    const areItemsNonEmpty = options.items?.length > 0;
    const needsToLoadAvailableItems = isInsightNonEmpty || areItemsNonEmpty;

    if (!needsToLoadAvailableItems) {
        const allDateDatasets = catalog.dateDatasets();
        return {
            allDateDatasets,
            availableDateDatasets: allDateDatasets,
        };
    }

    let availableLoader = catalog.availableItems();
    if (isInsightNonEmpty) {
        // Strip dimensionality from measure value filters when not explicitly included
        const insightToUse = options.insight;
        availableLoader = availableLoader.forInsight(insightToUse);
    }
    if (areItemsNonEmpty) {
        availableLoader = availableLoader.forItems(options.items);
    }

    const availableCatalog = await availableLoader.load();

    return {
        allDateDatasets: availableCatalog.dateDatasets(),
        availableDateDatasets: availableCatalog.availableDateDatasets(),
    };
}

/**
 * Creates a fingerprint for date datasets loading that includes all relevant options.
 */
function createDateDatasetsFingerprint(projectId: string, options: ILoadDateDatasetsOptions): string {
    const insightFingerprint = options.insight
        ? defFingerprint(newDefForInsight(projectId, options.insight))
        : "no-insight";
    const itemsFingerprint = options.items?.length
        ? defFingerprint(newDefForItems(projectId, options.items))
        : "no-items";
    const includeTags = options.includeObjectsWithTags?.map(objRefToString).sort().join(",") ?? "";
    const excludeTags = options.excludeObjectsWithTags?.map(objRefToString).sort().join(",") ?? "";
    const datasetId = options.dataSetIdentifier ? objRefToString(options.dataSetIdentifier) : "";

    return `${projectId}|${insightFingerprint}|${itemsFingerprint}|${includeTags}|${excludeTags}|${datasetId}`;
}

export const loadDateDatasetsWithCaching = (
    loadDateDatasetsFn: (projectId: string, options: ILoadDateDatasetsOptions) => Promise<IDateDatasets>,
) => {
    let lastFingerprint: string | undefined;
    let lastResult: IDateDatasets | undefined;
    let inFlightPromise: Promise<IDateDatasets> | undefined;
    let inFlightFingerprint: string | undefined;

    return async (projectId: string, options: ILoadDateDatasetsOptions = {}): Promise<IDateDatasets> => {
        const fingerprint = createDateDatasetsFingerprint(projectId, options);

        // Return cached result if fingerprint matches
        if (lastFingerprint === fingerprint && lastResult) {
            return lastResult;
        }

        // Reuse in-flight request if fingerprint matches
        if (inFlightFingerprint === fingerprint && inFlightPromise) {
            return inFlightPromise;
        }

        // Start new request
        inFlightFingerprint = fingerprint;
        inFlightPromise = loadDateDatasetsFn(projectId, options)
            .then((result) => {
                // Only update cache if this is still the current request
                // This prevents stale results from overwriting newer data when requests complete out of order
                if (fingerprint === inFlightFingerprint) {
                    lastResult = result;
                    lastFingerprint = fingerprint;
                }
                return result;
            })
            .catch((e) => {
                // Only bust cache if this is still the current request
                // This prevents clearing valid cache from a newer request that completed successfully
                if (fingerprint === inFlightFingerprint) {
                    lastResult = undefined;
                    lastFingerprint = undefined;
                }
                throw e;
            })
            .finally(() => {
                // Clear in-flight tracking when done
                if (inFlightFingerprint === fingerprint) {
                    inFlightPromise = undefined;
                    inFlightFingerprint = undefined;
                }
            });

        return inFlightPromise;
    };
};

export const loadCachedDateDatasets = loadDateDatasetsWithCaching(loadDateDatasets);

export interface ILoadDateDatasetsOptions {
    insight?: IInsightDefinition;
    items?: IAttributeOrMeasure[];
    excludeObjectsWithTags?: ObjRef[];
    includeObjectsWithTags?: ObjRef[];
    dataSetIdentifier?: ObjRef;
    production?: boolean;
}

export async function loadDateDatasets(
    projectId: string,
    options: ILoadDateDatasetsOptions = {},
): Promise<IDateDatasets> {
    const { allDateDatasets, availableDateDatasets } = await fetchDateDatasets(projectId, options);
    return {
        available: availableDateDatasets.map((item) => convertDateDatasetToLegacyForm(item)),
        allItems: allDateDatasets.map((item) =>
            convertDateDatasetToLegacyForm(item, isDateDatasetItemAvailable(item, availableDateDatasets)),
        ),
        unavailable: allDateDatasets.length - availableDateDatasets.length,
    };
}

/**
 * Loads both insight specific date datasets for a given insight and current dataset,
 * and completely all date datasets for itemCache.
 *
 * Unfortunately, the allDateDatasets from the \{insight,dataset\}-aware response are not the same
 * as really all date datasets in the project (nor should they be), but we need both of them:
 * - the \{insight,dataset\}-aware allDateDatasets are needed for correct number of unrelated items hidden.
 * - the "really" allDateDatasets are needed to make sure itemCache has information even for datasets
 * that could otherwise be hidden by tag config, dataset or other options.
 *
 * @param insight - insight to check item availability for
 * @param state -
 */
async function getDateDatasetsForItemCache(insight: IInsight, state: IAppState) {
    const projectId = getProjectId(state);
    const { dataset } = getRouteParams(state);

    const [insightAwareDateDatasets, { allDateDatasets }] = await Promise.all([
        fetchDateDatasets(projectId, {
            dataSetIdentifier: dataset && idRef(dataset),
            insight,
        }),
        fetchDateDatasets(projectId),
    ]);

    return {
        insightAwareDateDatasets,
        allDateDatasets,
    };
}

function catalogDateAttributeToDateAttribute(attribute: ICatalogDateAttribute): ICatalogEntry {
    return {
        dateType: attribute.granularity,
        dfRef: attribute.defaultDisplayForm.ref,
        dfIdentifier: attribute.defaultDisplayForm.id,
        dfIdentifiers: [attribute.defaultDisplayForm.id], // other attr display forms ids...
        dfUri: attribute.defaultDisplayForm.uri,
        dfUris: [attribute.defaultDisplayForm.uri], // other attr display forms uris...
        displayForms:
            attribute.attribute.displayForms?.map((df: IAttributeDisplayFormMetadataObject) => ({
                id: df.id,
                uri: df.uri,
                ref: df.ref,
                type: df.displayFormType,
                title: df.title,
            })) ?? [],
        dimensionUri: "", // TODO
        elementsUri: "", // TODO
        granularity: attribute.attribute.id, // for some reason, this is not granularity...
        id: attribute.attribute.id,
        identifier: attribute.attribute.id,
        isAvailable: true,
        summary: attribute.attribute.description,
        title: attribute.attribute.title,
        type: "attribute",
        uri: attribute.attribute.uri,
        ref: attribute.attribute.ref,
    };
}

/**
 * Options for loading valid dimensionality attributes.
 */
export interface ILoadValidDimensionalityOptions {
    /**
     * Execution items that should be used to compute valid dimensionality attributes (computeValidObjects).
     *
     * These should include:
     * - all measures from the current insight
     * - the MVF measure (if it is not already in the insight)
     * - attributes: either insight attributes OR MVF dimensionality attributes (if MVF has its own dimensionality)
     */
    items: IAttributeOrMeasure[];
    excludeObjectsWithTags?: ObjRef[];
    includeObjectsWithTags?: ObjRef[];
    dataSetIdentifier?: ObjRef;
    production?: boolean;
    /**
     * Whether computed attributes may take part. Asking for the type changes both the catalog
     * request and the computeValidObjects body, so it stays behind the feature flag.
     *
     * Temporary, together with `enableComputedAttributes` itself: drop the option and ask for the
     * type unconditionally once the flag is gone.
     */
    enableComputedAttributes?: boolean;
}

/**
 * Loads valid attributes that can be used for measure value filter dimensionality.
 * Uses computeValidObjects API to validate attributes against the provided execution items.
 */
async function fetchValidDimensionalityAttributes(
    projectId: string,
    options: ILoadValidDimensionalityOptions,
): Promise<
    Array<{
        attribute: IAttributeMetadataObject;
        displayFormRef: ObjRef;
        dataSetTitle?: string;
        dataSetRef?: ObjRef;
    }>
> {
    const catalogLoader = backend
        .workspace(projectId)
        .catalog()
        .withOptions({
            types: options.enableComputedAttributes ? ["attribute", "computedAttribute"] : ["attribute"],
            excludeTags: options.excludeObjectsWithTags ?? [],
            includeTags: options.includeObjectsWithTags ?? [],
            dataset: options.dataSetIdentifier,
            production: options.production,
        });

    const catalog = await catalogLoader.load();

    // Load available attributes for provided execution items (this uses computeValidObjects internally)
    const availableLoader = catalog.availableItems().withOptions({ items: options.items });
    const availableCatalog = await availableLoader.load();
    const availableAttributes = availableCatalog.availableAttributes().map((catalogAttr) => {
        const dataSet = catalogAttr.dataSet ?? catalogAttr.attribute.dataSet;

        return {
            attribute: catalogAttr.attribute,
            displayFormRef: catalogAttr.defaultDisplayForm.ref,
            dataSetTitle: dataSet?.title,
            dataSetRef: dataSet?.ref,
        };
    });
    const availableComputedAttributes = (
        options.enableComputedAttributes ? availableCatalog.availableComputedAttributes() : []
    ).map((catalogAttr) => {
        const dataSet = catalogAttr.computedAttribute.dataSet;

        return {
            attribute: {
                ...catalogAttr.computedAttribute,
                type: "attribute" as const,
            },
            displayFormRef: catalogAttr.defaultDisplayForm.ref,
            dataSetTitle: dataSet?.title,
            dataSetRef: dataSet?.ref,
        };
    });

    return mergeSortedAlphabeticallyByTitle(
        availableAttributes,
        availableComputedAttributes,
        (item) => item.attribute.title,
    );
}

/**
 * Loads valid dimensionality attributes for a measure value filter.
 * Returns attributes grouped by their dataset.
 */
async function loadValidDimensionalityAttributesUncached(
    projectId: string,
    options: ILoadValidDimensionalityOptions,
): Promise<
    Map<
        string,
        {
            datasetTitle?: string;
            datasetRef?: ObjRef;
            attributes: Array<{
                attribute: IAttributeMetadataObject;
                displayFormRef: ObjRef;
            }>;
        }
    >
> {
    const attributes = await fetchValidDimensionalityAttributes(projectId, options);

    // Group attributes by dataset
    const grouped = new Map<
        string,
        {
            datasetTitle?: string;
            datasetRef?: ObjRef;
            attributes: Array<{
                attribute: IAttributeMetadataObject;
                displayFormRef: ObjRef;
            }>;
        }
    >();

    for (const attrInfo of attributes) {
        const datasetKey = attrInfo.dataSetRef ? objRefToString(attrInfo.dataSetRef) : "__ungrouped__";
        if (!grouped.has(datasetKey)) {
            grouped.set(datasetKey, {
                datasetTitle: attrInfo.dataSetTitle,
                datasetRef: attrInfo.dataSetRef,
                attributes: [],
            });
        }
        grouped.get(datasetKey).attributes.push({
            attribute: attrInfo.attribute,
            displayFormRef: attrInfo.displayFormRef,
        });
    }

    return grouped;
}

type ValidDimensionalityResult = Map<
    string,
    {
        datasetTitle?: string;
        datasetRef?: ObjRef;
        attributes: Array<{
            attribute: IAttributeMetadataObject;
            displayFormRef: ObjRef;
        }>;
    }
>;

/**
 * Creates a cache key fingerprint for dimensionality attributes loading.
 * Combines project ID, items fingerprint, and tag configuration.
 */
function createDimensionalityFingerprint(
    projectId: string,
    options: ILoadValidDimensionalityOptions,
): string {
    // Create execution definition from items to generate fingerprint
    const itemsFingerprint = defFingerprint(newDefForItems(projectId, options.items));

    // Include tag configuration in cache key
    const includeTags = options.includeObjectsWithTags?.map(objRefToString).sort().join(",") ?? "";
    const excludeTags = options.excludeObjectsWithTags?.map(objRefToString).sort().join(",") ?? "";
    const datasetId = options.dataSetIdentifier ? objRefToString(options.dataSetIdentifier) : "";

    // enableComputedAttributes is deliberately NOT part of the key: feature flags come from
    // bootstrap and cannot change without a full app reload, so it is constant for the cache's
    // whole lifetime.
    return `${projectId}|${itemsFingerprint}|${includeTags}|${excludeTags}|${datasetId}`;
}

/**
 * Creates a cached version of the dimensionality attributes loader.
 * Handles concurrent requests by reusing in-flight promises.
 */
const loadValidDimensionalityAttributesWithCaching = (
    loadFn: (
        projectId: string,
        options: ILoadValidDimensionalityOptions,
    ) => Promise<ValidDimensionalityResult>,
) => {
    let lastFingerprint: string | undefined;
    let lastResult: ValidDimensionalityResult | undefined;
    let inFlightPromise: Promise<ValidDimensionalityResult> | undefined;
    let inFlightFingerprint: string | undefined;

    return async (
        projectId: string,
        options: ILoadValidDimensionalityOptions,
    ): Promise<ValidDimensionalityResult> => {
        const fingerprint = createDimensionalityFingerprint(projectId, options);

        // Return cached result if fingerprint matches
        if (lastFingerprint === fingerprint && lastResult) {
            return lastResult;
        }

        // Reuse in-flight request if fingerprint matches
        if (inFlightFingerprint === fingerprint && inFlightPromise) {
            return inFlightPromise;
        }

        // Start new request
        inFlightFingerprint = fingerprint;
        inFlightPromise = loadFn(projectId, options)
            .then((result) => {
                // Only update cache if this is still the current request
                // This prevents stale results from overwriting newer data when requests complete out of order
                if (fingerprint === inFlightFingerprint) {
                    lastResult = result;
                    lastFingerprint = fingerprint;
                }
                return result;
            })
            .catch((e) => {
                // Only bust cache if this is still the current request
                // This prevents clearing valid cache from a newer request that completed successfully
                if (fingerprint === inFlightFingerprint) {
                    lastResult = undefined;
                    lastFingerprint = undefined;
                }
                throw e;
            })
            .finally(() => {
                // Clear in-flight tracking when done
                if (inFlightFingerprint === fingerprint) {
                    inFlightPromise = undefined;
                    inFlightFingerprint = undefined;
                }
            });

        return inFlightPromise;
    };
};

/**
 * Loads valid dimensionality attributes for a measure value filter.
 * Results are cached based on fingerprint of provided items and options.
 */
export const loadValidDimensionalityAttributes = loadValidDimensionalityAttributesWithCaching(
    loadValidDimensionalityAttributesUncached,
);

export async function getItemCacheItems(insight: IInsight, state: IAppState) {
    const [{ allDateDatasets, insightAwareDateDatasets }, filterItems] = await Promise.all([
        getDateDatasetsForItemCache(insight, state),
        loadFilterElements(insight, state),
    ]);

    const availableDateAttributes = insightAwareDateDatasets.availableDateDatasets.flatMap(
        (ds) => ds.dateAttributes,
    );

    const insightAttrs = insightAttributes(insight);

    const dateAttrMatches = insightAttrs.map((attr) =>
        availableDateAttributes.find(({ defaultDisplayForm }) =>
            areObjRefsEqual(attributeDisplayFormRef(attr), defaultDisplayForm.ref),
        ),
    );
    const accumulator: ICatalogEntries = {};
    const dateAttrs = compact(dateAttrMatches).reduce((acc, curr) => {
        acc[curr.attribute.id] = catalogDateAttributeToDateAttribute(curr);
        return acc;
    }, accumulator);

    // slice-owned subtree — the selector serves the empty cache before it materializes
    const currentCache = getItemCacheState(state);

    return {
        // SHALLOW merge: the loaded date attributes REPLACE an entry of the same key rather than
        // merging field by field (which is what the slice's own `mergeItemsIntoCache` does,
        // deliberately differently)
        itemCache: { ...currentCache, ...dateAttrs },
        filterItems,
        availableDateDatasets: {
            available: insightAwareDateDatasets.availableDateDatasets.map((item) =>
                convertDateDatasetToLegacyForm(item),
            ),
            unavailable:
                insightAwareDateDatasets.allDateDatasets.length -
                insightAwareDateDatasets.availableDateDatasets.length,
        },
        allDateDatasets: {
            available: allDateDatasets.map((item) =>
                convertDateDatasetToLegacyForm(
                    item,
                    isDateDatasetItemAvailable(item, insightAwareDateDatasets.availableDateDatasets),
                ),
            ),
            unavailable: 0,
        },
    };
}

export async function loadValidElementsData(
    projectId: string,
    dfRef: ObjRef,
    attributeElements: string[],
): Promise<IAttributeValidElementsData> {
    const elements = isElementUrisSupported() ? { uris: attributeElements } : { values: attributeElements };
    const result = await backend
        .workspace(projectId)
        .attributes()
        .elements()
        .forDisplayForm(dfRef)
        .withLimit(attributeElements.length)
        .withOptions({
            elements,
        })
        .query();

    const { items, totalCount } = result;
    const selectedElements = uniqBy(items, (item) => item.uri);

    return {
        items: selectedElements,
        totalCount,
    };
}

export async function getAttributeDisplayForms(
    projectId: string,
    objRefs: ObjRef[],
): Promise<IAttributeDisplayFormMetadataObject[]> {
    return await backend.workspace(projectId).attributes().getAttributeDisplayForms(objRefs);
}

export async function getAttributes(
    projectId: string,
    objRefs: ObjRef[],
): Promise<IAttributeMetadataObject[]> {
    return await backend.workspace(projectId).attributes().getAttributes(objRefs);
}

/**
 * Loads computed attributes by their refs. A computed attribute has no labels, so it cannot be resolved
 * through the attributes service; it is loaded through its own service. Rejects when any of the refs
 * does not resolve.
 */
export async function getComputedAttributes(
    projectId: string,
    objRefs: ObjRef[],
): Promise<IComputedAttributeMetadataObject[]> {
    const service = backend.workspace(projectId).computedAttributes();
    return Promise.all(objRefs.map((ref) => service.getComputedAttribute(ref)));
}

export async function getInsightReferences(
    projectId: string,
    insightRef: ObjRef,
): Promise<IInsightReferencing> {
    return backend.workspace(projectId).insights().getInsightReferencingObjects(insightRef);
}

export async function getAnalyticalDashboards(projectId: string): Promise<IListedDashboard[]> {
    return backend.workspace(projectId).dashboards().getDashboards();
}
