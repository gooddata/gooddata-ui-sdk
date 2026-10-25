// (C) 2007-2026 GoodData Corporation

import { union } from "lodash-es";
import { type IntlShape } from "react-intl";
import { createSelector } from "reselect";

import {
    type IAttributeMetadataObject,
    type IAttributeOrMeasure,
    type IInsightDefinition,
    type IMeasureValueFilter as IMeasureValueFilterModel,
    type ObjRef,
    type ObjRefInScope,
    areObjRefsEqual,
    attributeDisplayFormRef,
    attributeLocalId,
    insightAttributes,
    insightMeasures,
    isLocalIdRef,
    measureLocalId,
    newAttribute,
    newMeasure,
    objRefToString,
} from "@gooddata/sdk-model";
import { type IDimensionalityItem, type WarningMessage } from "@gooddata/sdk-ui-filters";
import { type IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";

import { GRANULARITY_OPTIONS, isChronologicalGranularity } from "../../models/granularity.js";
import {
    FilterBar,
    type IMeasureValueFilter,
    type IRankingFilter,
} from "../../store/filter_bar/filter_bar_types.js";
import {
    getExtendedReferencePointSecondaryXAxisMeasures,
    getExtendedReferencePointSecondaryYAxisMeasures,
} from "../../store/reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../../store/types.js";
import { type IDateDatasets } from "../../typings/datasets.js";
import type { ICacheItemDisplayForm, ICatalogEntries } from "../../typings/state_objects.js";
import { fromSdkModelDimensionality, toSdkModelDimensionality } from "../../utils/dimensionality.js";

/**
 * Gets the measure identifier from a measure value filter.
 * For catalog measures, returns the objRef as string.
 * For bucket measures, returns the local identifier.
 */
export const getMeasureIdentifier = (filter: IMeasureValueFilter): string => {
    if (FilterBar.isCatalogMeasureValueFilter(filter)) {
        return objRefToString(filter.measureRef);
    }
    return filter.measureLocalIdentifier;
};

/**
 * Builds a visualization filter (SDK model format) from an AD measure value filter.
 * Converts dimensionality from AD format (string | ObjRef) to SDK format (ObjRefInScope).
 */
export const buildVisualizationFilter = (filter: IMeasureValueFilter): IMeasureValueFilterModel => {
    const { conditions, measureLocalIdentifier, measureRef, dimensionality, applyOnResult } = filter;
    const conditionsProps = conditions?.length > 1 ? { conditions } : {};
    const conditionProps = conditions?.length === 1 ? { condition: conditions[0] } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const measure = FilterBar.isCatalogMeasureValueFilter(filter)
        ? measureRef
        : { localIdentifier: measureLocalIdentifier };

    const dimensionalityProps = dimensionality
        ? { dimensionality: toSdkModelDimensionality(dimensionality) }
        : {};

    return {
        measureValueFilter: {
            measure,
            ...conditionProps,
            ...conditionsProps,
            ...dimensionalityProps,
            ...applyOnResultProp,
        },
    };
};

/**
 * Updates an AD measure value filter with new condition and dimensionality from SDK model filter.
 * Converts dimensionality from SDK format (ObjRefInScope) to AD format (string | ObjRef).
 */
export const updateFilterCondition = (
    filter: IMeasureValueFilter,
    afmFilter: IMeasureValueFilterModel | null,
): IMeasureValueFilter => {
    if (afmFilter === null) {
        return {
            ...filter,
            conditions: undefined,
            dimensionality: undefined,
        };
    }

    const legacyCondition = afmFilter.measureValueFilter.condition;
    const conditions = afmFilter.measureValueFilter.conditions?.length
        ? afmFilter.measureValueFilter.conditions
        : legacyCondition
          ? [legacyCondition]
          : undefined;

    return {
        ...filter,
        conditions,
        dimensionality: fromSdkModelDimensionality(afmFilter.measureValueFilter.dimensionality),
        applyOnResult: afmFilter.measureValueFilter.applyOnResult,
    };
};

/**
 * Determines the warning message to display based on filter state.
 */
export const getWarningMessage = (
    intl: IntlShape,
    displayRankingFilterWarningMessage: boolean,
    displayPercentWarningMessage: boolean,
): WarningMessage => {
    if (displayRankingFilterWarningMessage) {
        return {
            text: intl.formatMessage({ id: "filter.measure.ranking_warning" }),
            severity: "low",
        };
    }
    if (displayPercentWarningMessage) {
        return {
            text: intl.formatMessage({ id: "filter.measure.percentage_warning" }),
            severity: "medium",
        };
    }
    return null;
};

/**
 * Result of resolving a dimensionality item from bucket items or item cache.
 */
interface IResolvedDimensionalityItem {
    title: string;
    type: "attribute" | "chronologicalDate" | "genericDate";
}

/**
 * Cache key prefixes for looking up items in the item cache.
 */
const CACHE_KEY_PREFIXES = {
    ATTRIBUTE: "attribute.",
    METRIC: "metric.",
} as const;

/**
 * Valid dimensionality item types that can be used for filtering.
 */
const VALID_DIMENSIONALITY_TYPES = new Set<IResolvedDimensionalityItem["type"]>([
    "attribute",
    "chronologicalDate",
    "genericDate",
]);

/**
 * Determines the type of dimensionality item based on its date type.
 */
const getDateDimensionalityType = (dateType: string | undefined): IResolvedDimensionalityItem["type"] => {
    if (!dateType) {
        return "attribute";
    }
    return isChronologicalGranularity(dateType) ? "chronologicalDate" : "genericDate";
};

/**
 * Validates and safely casts a bucket item type to a dimensionality type.
 */
const toBucketDimensionalityType = (
    bucketItemType: string | undefined,
): IResolvedDimensionalityItem["type"] => {
    if (bucketItemType && (VALID_DIMENSIONALITY_TYPES as ReadonlySet<string>).has(bucketItemType)) {
        return bucketItemType as IResolvedDimensionalityItem["type"];
    }
    return "attribute";
};

/**
 * Resolves dimensionality item from bucket items (for items in the visualization).
 */
const resolveFromBucketItems = (
    localId: string,
    bucketItemNames: IBucketItemDescriptors,
): IResolvedDimensionalityItem => {
    const bucketItem = bucketItemNames[localId];
    return {
        title: bucketItem?.name ?? localId,
        type: toBucketDimensionalityType(bucketItem?.type),
    };
};

/**
 * Resolves dimensionality item from item cache (for catalog items not in buckets).
 */
const resolveFromCache = (ref: ObjRef, itemCache: ICatalogEntries): IResolvedDimensionalityItem => {
    const refString = objRefToString(ref);

    // The dimensionality points to a display form (e.g. "label.*"), find the owning attribute in cache and use the its title.
    const cacheItemWithMatchingDisplayForm = Object.values(itemCache).find((cacheItem) => {
        const displayForms = cacheItem.displayForms;
        if (!displayForms) {
            return false;
        }

        return displayForms.some((df: ICacheItemDisplayForm) => areObjRefsEqual(df.ref, ref));
    });

    if (cacheItemWithMatchingDisplayForm) {
        return {
            title: cacheItemWithMatchingDisplayForm.title,
            type: getDateDimensionalityType(cacheItemWithMatchingDisplayForm.dateType),
        };
    }

    // Try direct lookup (date granularity items like "GDC.time.month")
    const dateCacheItem = itemCache[refString];
    if (dateCacheItem) {
        const cacheItemType = dateCacheItem.type;
        const dateType = dateCacheItem.dateType;
        if (cacheItemType === "date" || dateType) {
            // If it's a date item but dateType is undefined, default to chronologicalDate
            // (isChronologicalGranularity(undefined) returns true per its comment)
            if (!dateType && cacheItemType === "date") {
                return {
                    title: dateCacheItem.title ?? refString,
                    type: "chronologicalDate",
                };
            }
            return {
                title: dateCacheItem.title ?? refString,
                type: getDateDimensionalityType(dateType),
            };
        }
        return {
            title: dateCacheItem.title ?? refString,
            type: "attribute",
        };
    }

    // Try metric cache (measures should not be in the dimensionality, but handle gracefully)
    const metricCacheItem = itemCache[`${CACHE_KEY_PREFIXES.METRIC}${refString}`];
    if (metricCacheItem) {
        return {
            title: metricCacheItem.title ?? refString,
            type: "attribute",
        };
    }

    // Fallback for unknown items
    return { title: refString, type: "attribute" };
};

/**
 * Resolves the title and type for a dimensionality item from bucket items or item cache.
 * For LocalIdRef: looks up from bucketItemNames by localIdentifier.
 * For ObjRef: looks up from itemCache by identifier or uri (for external items not in buckets).
 */
export const resolveDimensionalityItem = (
    item: ObjRefInScope,
    bucketItemNames: IBucketItemDescriptors,
    itemCache: ICatalogEntries,
): IResolvedDimensionalityItem => {
    if (isLocalIdRef(item)) {
        return resolveFromBucketItems(item.localIdentifier, bucketItemNames);
    }
    return resolveFromCache(item, itemCache);
};

/**
 * Builds dimensionality items with resolved titles and types for the dropdown.
 *
 * @param dimensionality - The dimensionality array from the filter (ObjRefInScope[])
 * @param bucketItemNames - Bucket item descriptors for resolving titles/types
 * @param itemCache - Item cache for resolving catalog items
 * @param localIdToRef - Optional map from local identifiers to display form refs.
 *   When provided, LocalIdRef items will have their `ref` property populated,
 *   enabling proper deduplication against catalog items.
 */
export const buildDimensionalityWithTitles = (
    dimensionality: ObjRefInScope[] | undefined,
    bucketItemNames: IBucketItemDescriptors,
    itemCache: ICatalogEntries,
    localIdToRef?: Map<string, ObjRef>,
): IDimensionalityItem[] | undefined => {
    if (dimensionality === undefined) {
        return undefined;
    }
    if (dimensionality.length === 0) {
        return [];
    }

    return dimensionality.map((item) => {
        const resolved = resolveDimensionalityItem(item, bucketItemNames, itemCache);
        // For LocalIdRef items, attach the display form ref for deduplication against catalog items.
        const ref = isLocalIdRef(item) ? localIdToRef?.get(item.localIdentifier) : item;
        return {
            identifier: item,
            ref,
            title: resolved.title,
            type: resolved.type,
        };
    });
};

/**
 * Builds a map from a bucket attribute's local identifier to its display-form ObjRef.
 *
 * The same attribute is referenced two ways: bucket attributes by local id (string/LocalIdRef) and
 * catalog attributes by ObjRef. This map bridges the two so bucket dimensionality items can be
 * deduplicated/compared against catalog candidates. Shared by the measure value filter and ranking filter.
 */
export const buildLocalIdToDisplayFormRefMap = (
    insight: IInsightDefinition | null | undefined,
): Map<string, ObjRef> => {
    const map = new Map<string, ObjRef>();
    if (insight) {
        insightAttributes(insight).forEach((attr) => {
            map.set(attributeLocalId(attr), attributeDisplayFormRef(attr));
        });
    }
    return map;
};

/**
 * Builds insight dimensionality (default bucket attributes/dates) for reset functionality.
 */
export const buildInsightDimensionality = (
    insightDimensionalityItems: IBucketItemDescriptors,
    localIdToRef?: Map<string, ObjRef>,
): IDimensionalityItem[] | undefined => {
    const localIds = Object.keys(insightDimensionalityItems);
    if (!localIds.length) {
        return undefined;
    }
    return localIds
        .map((localId) => {
            const bucketItem = insightDimensionalityItems[localId];
            if (bucketItem?.type === "measure") {
                return undefined;
            }
            return {
                identifier: { localIdentifier: localId },
                ref: localIdToRef?.get(localId),
                title: bucketItem?.name ?? localId,
                type: bucketItem?.type ?? "attribute",
            };
        })
        .filter(Boolean);
};

/**
 * Selector helper: Get secondary X-axis measures from state.
 */
/** stable fallback: both are `createSelector` inputs, so a fresh [] would recompute every read */
const NO_AXIS_MEASURES: string[] = Object.freeze([]) as unknown as string[];

function getSecondaryXAxisMeasures(state: IAppState): string[] {
    return getExtendedReferencePointSecondaryXAxisMeasures(state, NO_AXIS_MEASURES);
}

/**
 * Selector helper: Get secondary Y-axis measures from state.
 */
function getSecondaryYAxisMeasures(state: IAppState): string[] {
    return getExtendedReferencePointSecondaryYAxisMeasures(state, NO_AXIS_MEASURES);
}

/**
 * Selector: Get all secondary axis measures (X and Y combined).
 */
export const getSecondaryAxisMeasures = createSelector(
    getSecondaryXAxisMeasures,
    getSecondaryYAxisMeasures,
    // `union` drops duplicates, which the one consumer cannot observe: it asks "is this measure on
    // a secondary axis", a membership test.
    (secondaryXAxisMeasures, secondaryYAxisMeasures) => union(secondaryXAxisMeasures, secondaryYAxisMeasures),
);

/**
 * Type for valid attributes map returned by loadValidDimensionalityAttributes.
 */
export type ValidAttributesMap = Map<
    string,
    {
        datasetTitle?: string;
        datasetRef?: ObjRef;
        attributes: Array<{ attribute: IAttributeMetadataObject; displayFormRef: ObjRef }>;
    }
>;

/**
 * Converts valid attributes map to IDimensionalityItem array.
 */
export const buildAttributeCatalogItems = (validAttributesMap: ValidAttributesMap): IDimensionalityItem[] => {
    return Array.from(validAttributesMap.values()).flatMap((group) =>
        group.attributes.map(({ attribute, displayFormRef }) => ({
            identifier: displayFormRef,
            ref: displayFormRef,
            title: attribute.title,
            type: "attribute" as const,
            dataset:
                group.datasetRef && group.datasetTitle
                    ? {
                          identifier: group.datasetRef,
                          title: group.datasetTitle,
                      }
                    : undefined,
        })),
    );
};

/**
 * Builds date dimensionality title from granularity and dataset title.
 */
export const buildDateDimensionalityTitle = (
    granularity: string,
    dateDatasetTitle: string,
    intl: IntlShape,
): string => {
    const option = GRANULARITY_OPTIONS.find((o) => o.dateType === granularity);
    const granularityLabel = option ? intl.formatMessage({ id: option.label }) : granularity;
    return `${dateDatasetTitle} - ${granularityLabel}`;
};

/**
 * Converts date datasets to IDimensionalityItem array with dataset info included.
 * Uses date attribute title from metadata when available, falls back to constructed title.
 */
export const buildDateCatalogItems = (
    dateDatasets: IDateDatasets,
    intl: IntlShape,
): IDimensionalityItem[] => {
    return dateDatasets.available.flatMap((dateDataset) =>
        dateDataset.attributes.map((dateAttribute) => ({
            identifier: dateAttribute.dfRef,
            ref: dateAttribute.dfRef,
            title:
                dateAttribute.title ??
                buildDateDimensionalityTitle(dateAttribute.dateType, dateDataset.title, intl),
            type: isChronologicalGranularity(dateAttribute.dateType)
                ? ("chronologicalDate" as const)
                : ("genericDate" as const),
            dataset: {
                identifier: dateDataset.ref,
                title: dateDataset.title,
            },
        })),
    );
};

/**
 * Resolves a stored dimensionality list — the measure value filter `dimensionality` or the ranking filter
 * `attributes` (`(string | ObjRef)[]`, bucket local ids and catalog ObjRefs) — to insight attribute objects:
 * a local id resolves to the matching insight attribute, an ObjRef becomes a catalog attribute.
 */
const resolveDimensionalityAttributes = (
    dimensionality: Array<string | ObjRefInScope>,
    attributesFromInsight: ReturnType<typeof insightAttributes>,
) =>
    dimensionality
        .map((item) => {
            // Bucket attributes are referenced by local id (a plain string in the stored dimensionality, a
            // LocalIdRef in an in-progress override); catalog attributes are referenced by ObjRef.
            if (typeof item === "string") {
                return attributesFromInsight.find((a) => attributeLocalId(a) === item);
            }
            if (isLocalIdRef(item)) {
                return attributesFromInsight.find((a) => attributeLocalId(a) === item.localIdentifier);
            }
            return newAttribute(item);
        })
        .filter((a): a is NonNullable<typeof a> => Boolean(a));

/**
 * Builds the computeValidObjects availability items shared by the measure value filter dimensionality and the
 * ranking filter "out of" attributes: the insight measures, the filtered/ranked measure (bucket or catalog),
 * and the effective dimensionality — the explicit `override` when provided (authoritative even when empty, so
 * a cleared selection stays cleared), else the filter's own dimensionality, reusing all insight attributes
 * only when the filter has none of its own.
 */
const buildDimensionalityAvailabilityItems = (
    insight: IInsightDefinition,
    isCatalogMeasure: boolean,
    measureRef: ObjRef | undefined,
    measureLocalIdentifier: string | undefined,
    ownDimensionality: Array<string | ObjRef> | undefined,
    override: ObjRefInScope[] | undefined,
): IAttributeOrMeasure[] => {
    const measures = insightMeasures(insight);
    const attributesFromInsight = insightAttributes(insight);

    const filterMeasure = isCatalogMeasure
        ? measureRef
            ? [newMeasure(measureRef)]
            : []
        : measureLocalIdentifier
          ? measures.filter((m) => measureLocalId(m) === measureLocalIdentifier)
          : [];

    // Resolve the effective dimensionality for the availability (computeValidObjects) context: the override
    // when it has items, else the filter's own dimensionality. An empty or absent selection means the filter
    // follows the insight's natural granularity, so it falls back to all insight attributes - this keeps the
    // picker offering valid catalog items (incl. date datasets) after the user clears the selection.
    const resolvedAttributes = override?.length
        ? resolveDimensionalityAttributes(override, attributesFromInsight)
        : ownDimensionality?.length
          ? resolveDimensionalityAttributes(ownDimensionality, attributesFromInsight)
          : undefined;

    const attributes = resolvedAttributes ?? attributesFromInsight;

    // Dedupe by execution localId to keep the payload small & stable.
    const unique = new Map<string, IAttributeOrMeasure>();
    [...measures, ...filterMeasure, ...attributes].forEach((item) => {
        const key = "attribute" in item ? `a:${attributeLocalId(item)}` : `m:${measureLocalId(item)}`;
        unique.set(key, item);
    });

    return Array.from(unique.values());
};

/**
 * Builds availability items for measure value filter dimensionality validation (computeValidObjects).
 */
export const buildMvfAvailabilityItems = (
    insight: IInsightDefinition,
    filter: IMeasureValueFilter,
    dimensionalityOverride?: ObjRefInScope[],
): IAttributeOrMeasure[] =>
    buildDimensionalityAvailabilityItems(
        insight,
        FilterBar.isCatalogMeasureValueFilter(filter),
        filter.measureRef,
        filter.measureLocalIdentifier,
        filter.dimensionality,
        dimensionalityOverride,
    );

/**
 * Builds availability items for ranking filter "out of" attribute validation (computeValidObjects).
 */
export const buildRankingAvailabilityItems = (
    insight: IInsightDefinition,
    filter: IRankingFilter,
    attributesOverride?: ObjRefInScope[],
): IAttributeOrMeasure[] =>
    buildDimensionalityAvailabilityItems(
        insight,
        FilterBar.isCatalogRankingFilter(filter),
        filter.measureRef,
        filter.measureLocalIdentifier,
        filter.attributes,
        attributesOverride,
    );

/**
 * Options for loading catalog dimensionality items.
 */
export interface ILoadCatalogDimensionalityOptions {
    projectId: string;
    /**
     * Insight to use for validation (computeValidObjects).
     */
    insight: IInsightDefinition;
    /**
     * Items to use for availability check (measures + dimensionality attributes).
     */
    availabilityItems: IAttributeOrMeasure[];
    datasetId?: string;
    includeObjectsWithTags?: ObjRef[];
    excludeObjectsWithTags?: ObjRef[];
    intl: IntlShape;
    enableComputedAttributes?: boolean;
}

/**
 * Loads catalog dimensionality items (attributes + dates) for the measure value filter picker.
 * Combines attribute and date loading, then merges and deduplicates the results.
 */
export const loadCatalogDimensionalityItems = async (
    options: ILoadCatalogDimensionalityOptions,
    loadValidDimensionalityAttributes: (
        projectId: string,
        opts: {
            items: IAttributeOrMeasure[];
            dataSetIdentifier?: ObjRef;
            includeObjectsWithTags?: ObjRef[];
            excludeObjectsWithTags?: ObjRef[];
            enableComputedAttributes?: boolean;
        },
    ) => Promise<ValidAttributesMap>,
    loadDateDatasets: (
        projectId: string,
        opts: {
            insight: IInsightDefinition;
            dataSetIdentifier?: ObjRef;
            includeObjectsWithTags?: ObjRef[];
            excludeObjectsWithTags?: ObjRef[];
        },
    ) => Promise<IDateDatasets>,
    idRef: (id: string) => ObjRef,
): Promise<IDimensionalityItem[]> => {
    const {
        projectId,
        insight,
        availabilityItems,
        datasetId,
        includeObjectsWithTags,
        excludeObjectsWithTags,
        intl,
        enableComputedAttributes,
    } = options;

    const dataSetIdentifier = datasetId ? idRef(datasetId) : undefined;

    // Load valid attributes
    const validAttributesMap = await loadValidDimensionalityAttributes(projectId, {
        items: availabilityItems,
        dataSetIdentifier,
        includeObjectsWithTags,
        excludeObjectsWithTags,
        enableComputedAttributes,
    });

    const attributeCatalogItems = buildAttributeCatalogItems(validAttributesMap);

    // Load date datasets
    const dateDatasets = await loadDateDatasets(projectId, {
        insight,
        dataSetIdentifier,
        includeObjectsWithTags,
        excludeObjectsWithTags,
    });

    const dateCatalogItems = buildDateCatalogItems(dateDatasets, intl);

    return [...attributeCatalogItems, ...dateCatalogItems];
};
