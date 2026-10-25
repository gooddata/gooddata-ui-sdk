// (C) 2026 GoodData Corporation

import { defineMessage } from "react-intl";

import {
    type CatalogItem,
    type ICatalogMeasure,
    type ObjRef,
    type ObjRefInScope,
    idRef,
    isCatalogMeasure,
    isComputedAttributeRef,
    isLocalIdRef,
    localIdRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { type IDimensionalityItem } from "@gooddata/sdk-ui-filters";
import {
    type IBucketItemDescriptors,
    type ICatalogItemPickerItem,
    type ICatalogItemPickerItems,
} from "@gooddata/sdk-ui-kit";

import { findAttributeCacheItemByRef } from "../../../models/item_cache_lookup.js";
import {
    type IAttributeFilter,
    type IMeasureValueFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IRawBucketItem, type IRawBucketItems } from "../../../typings/buckets.js";
import { type ICacheItem, type ICatalogEntries } from "../../../typings/state_objects.js";

export interface IMetricPickerItemPayload {
    type: "metric";
    ref: ObjRef;
    identifier: string;
    uri?: string;
    title: string;
    summary?: string;
    expression?: string;
    bucketItemLocalIdentifier?: string;
}

export interface IBucketMetricItem {
    id: string;
    title: string;
    payload: IMetricPickerItemPayload;
    sequenceNumber?: string;
    localIdentifier: string;
}

export interface ICatalogMeasureItem {
    id: string;
    title: string;
    payload: IMetricPickerItemPayload;
    groups: ObjRef[];
}

export const getFilteredAttributeRefKeys = (
    attributeFilters: ReadonlyArray<IAttributeFilter>,
    itemCache: ICatalogEntries,
): Set<string> => {
    return new Set(
        attributeFilters
            .map((filter) => {
                const cacheItem = findAttributeCacheItemByRef(
                    itemCache,
                    filter.cacheItemIdentifier,
                    filter.displayFormRef,
                );
                const dfRef = cacheItem?.dfRef ?? cacheItem?.ref;
                return dfRef ? serializeObjRef(dfRef) : undefined;
            })
            .filter((key): key is string => !!key),
    );
};

/**
 * Whether a picker item's attribute is already covered by an existing attribute filter.
 *
 * The key encoding lives here, next to the Set that produces it, because BOTH halves of the
 * add-filter dropdown probe that Set - the insight-attributes section below and the catalog
 * section in the picker hooks. Restating the encoding at each call site is how they silently
 * drifted apart and the catalog-side exclusion became a no-op.
 */
export const isAttributeRefFiltered = (
    filteredAttributeRefKeys: Set<string>,
    // a picker item's identifier is an ObjRefInScope, so a local-id ref can reach here; it simply
    // never matches a display-form key, which is the correct answer for it
    ref: ObjRef | ObjRefInScope | undefined,
): boolean => !!ref && filteredAttributeRefKeys.has(serializeObjRef(ref));

export const getAvailableInsightAttributeItems = (
    bucketAttributes: IRawBucketItems,
    bucketItemNames: IBucketItemDescriptors,
    filteredAttributeRefKeys: Set<string>,
): IDimensionalityItem[] => {
    const result: IDimensionalityItem[] = [];
    bucketAttributes.forEach((item) => {
        if (item?.type !== "attribute") {
            return;
        }
        const localIdentifier = item?.localIdentifier;
        const descriptor = bucketItemNames[localIdentifier];
        const title = descriptor?.name ?? localIdentifier;
        const dfRef = item?.dfRef ?? item?.ref;
        if (isAttributeRefFiltered(filteredAttributeRefKeys, dfRef)) {
            return;
        }
        result.push({
            identifier: localIdRef(localIdentifier),
            ref: dfRef,
            title,
            type: "attribute",
        });
    });
    return result;
};

export const toAttributePickerItems = (
    availableInsightItems: IDimensionalityItem[],
    availableCatalogAttributeItems: IDimensionalityItem[],
    getItemId: (item: IDimensionalityItem) => string,
): ICatalogItemPickerItems<IDimensionalityItem> => {
    const toPickerItem = (item: IDimensionalityItem): ICatalogItemPickerItem<IDimensionalityItem> => ({
        id: getItemId(item),
        title: item.title,
        type: "attribute",
        payload: item,
        ref: item.ref,
        dataset: item.dataset,
    });
    return {
        insightItems: availableInsightItems.map(toPickerItem),
        catalogItems: availableCatalogAttributeItems.map(toPickerItem),
    };
};

export const getMetricCacheItemsById = (itemCache: ICatalogEntries): Map<string, ICacheItem> => {
    const map = new Map<string, ICacheItem>();
    Object.values(itemCache).forEach((cacheItem) => {
        if (cacheItem.type === "metric") {
            map.set(cacheItem.identifier, cacheItem as ICacheItem);
        }
    });
    return map;
};

export const getBucketMeasureIdentifiers = (bucketMeasures: IRawBucketItems): Set<string> => {
    return new Set(
        [...(bucketMeasures ?? [])].filter((item) => item?.type === "metric").map((item) => item?.attribute),
    );
};

export const getFilteredMeasureRefKeys = (
    bucketMeasures: IRawBucketItems,
    measureValueFilters: ReadonlyArray<IMeasureValueFilter>,
): Set<string> => {
    const bucketMeasureByLocalId = new Map<string, IRawBucketItem>(
        [...(bucketMeasures ?? [])]
            .filter((item) => item?.type === "metric")
            .map((item) => [item?.localIdentifier, item] as const),
    );
    const refKeys = new Set<string>();
    measureValueFilters.forEach((filter) => {
        if (filter.measureRef) {
            refKeys.add(objRefToString(filter.measureRef));
        }
        if (filter.measureLocalIdentifier) {
            const bucketItem = bucketMeasureByLocalId.get(filter.measureLocalIdentifier);
            const ref = bucketItem?.ref;
            if (ref) {
                refKeys.add(objRefToString(ref));
            }
        }
    });
    return refKeys;
};

export const getFilteredMeasureIdentifiers = (
    bucketMeasures: IRawBucketItems,
    measureValueFilters: ReadonlyArray<IMeasureValueFilter>,
): Set<string> => {
    const identifiers = new Set<string>();
    measureValueFilters.forEach((filter) => {
        if (filter.measureLocalIdentifier) {
            const bucketItem = bucketMeasures.find(
                (item) => item?.localIdentifier === filter.measureLocalIdentifier,
            );
            if (bucketItem) {
                identifiers.add(bucketItem?.attribute);
            }
        }
    });
    return identifiers;
};

export const toMetricPayloadFromCacheItem = (
    cacheItem: ICacheItem,
    bucketItemLocalIdentifier?: string,
): IMetricPickerItemPayload => ({
    type: "metric",
    ref: cacheItem.ref,
    identifier: cacheItem.identifier ?? "",
    uri: cacheItem.uri,
    title: cacheItem.title,
    summary: cacheItem.summary,
    expression: cacheItem.expression,
    bucketItemLocalIdentifier,
});

export const toMetricPayloadFromCatalogMeasure = (item: ICatalogMeasure): IMetricPickerItemPayload => ({
    type: "metric",
    ref: item.measure.ref,
    identifier: item.measure.id,
    uri: item.measure.uri,
    title: item.measure.title,
    summary: item.measure.description,
    expression: item.measure.expression,
});

export const getBucketMetricItems = (
    bucketMeasures: IRawBucketItems,
    bucketItemNames: IBucketItemDescriptors,
    measureValueFilters: ReadonlyArray<IMeasureValueFilter>,
    metricCacheItemsById: Map<string, ICacheItem>,
): IBucketMetricItem[] => {
    return [...(bucketMeasures ?? [])]
        .filter((item) => item?.type === "metric")
        .map((item) => {
            const localIdentifier = item?.localIdentifier;
            const descriptor = bucketItemNames[localIdentifier];
            const title = descriptor?.name ?? localIdentifier;
            const identifier = item?.attribute;
            const baseCacheItem: ICacheItem = metricCacheItemsById.get(identifier) ?? {
                type: "metric",
                ref: idRef(identifier),
                identifier,
                title,
                uri: "",
            };
            return {
                id: `bucket:${localIdentifier}`,
                title,
                payload: toMetricPayloadFromCacheItem(baseCacheItem, localIdentifier),
                sequenceNumber:
                    descriptor?.sequenceNumber === undefined ? undefined : String(descriptor.sequenceNumber),
                localIdentifier,
            };
        })
        .filter((item) =>
            measureValueFilters.every((filter) => filter.measureLocalIdentifier !== item.localIdentifier),
        );
};

export const getCatalogMeasures = (
    availableCatalogItems: ReadonlyArray<CatalogItem>,
    bucketMeasureIdentifiers: Set<string>,
    filteredMeasureIdentifiers: Set<string>,
    filteredMeasureRefKeys: Set<string>,
): ICatalogMeasureItem[] => {
    const availableMeasures = availableCatalogItems.filter(isCatalogMeasure);
    return availableMeasures
        .filter((item) => !bucketMeasureIdentifiers.has(item.measure.id))
        .filter((item) => !filteredMeasureIdentifiers.has(item.measure.id))
        .filter((item) => !filteredMeasureRefKeys.has(objRefToString(item.measure.ref)))
        .map((item) => ({
            id: `catalog:${item.measure.id}`,
            title: item.measure.title,
            payload: toMetricPayloadFromCatalogMeasure(item),
            groups: item.groups ?? [],
        }));
};

const addToMap = (map: Map<string, ICacheItem>, itemRef: ObjRef | undefined, cacheItemJs: ICacheItem) => {
    if (itemRef) {
        map.set(serializeObjRef(itemRef), cacheItemJs);
    }
};

export const getCacheItemByRef = (itemCache: ICatalogEntries): Map<string, ICacheItem> => {
    const map = new Map<string, ICacheItem>();
    Object.values(itemCache).forEach((cacheItem) => {
        if (cacheItem.type === "attribute" || cacheItem.type === "computedAttribute") {
            const cacheItemJs = cacheItem as ICacheItem;

            // Standard attribute refs
            addToMap(map, cacheItem.dfRef, cacheItemJs);
            addToMap(map, cacheItem.ref, cacheItemJs);

            // Geo attributes may be represented by special display forms (e.g. location/area)
            addToMap(map, cacheItem.locationDisplayFormRef, cacheItemJs);
            addToMap(map, cacheItem.areaDisplayFormRef, cacheItemJs);

            // Map all attribute display forms, including geo pin display forms
            const displayForms = cacheItem.displayForms;
            if (Array.isArray(displayForms)) {
                displayForms.forEach((df) => {
                    addToMap(map, df?.ref, cacheItemJs);
                });
            }
        }
    });
    return map;
};

export const toAttributeCacheItems = (
    items: Array<IDimensionalityItem | ICacheItem>,
    cacheItemByRef: Map<string, ICacheItem>,
): ICacheItem[] => {
    return items
        .filter((item): item is IDimensionalityItem => item.type !== "metric")
        .map((item) => {
            const ref = item.ref ?? (isLocalIdRef(item.identifier) ? undefined : item.identifier);
            if (!ref) {
                return undefined;
            }
            const cachedItem = cacheItemByRef.get(serializeObjRef(ref));
            if (cachedItem) {
                return cachedItem;
            }
            // Create cache item from catalog attribute (not in insight).
            // Use display form ref string as identifier for cache key consistency.
            return {
                type: isComputedAttributeRef(ref) ? ("computedAttribute" as const) : ("attribute" as const),
                ref,
                dfRef: ref,
                title: item.title,
                identifier: objRefToString(ref),
                uri: "",
            };
        })
        .filter((item): item is ICacheItem => !!item);
};

/**
 * Type for items being added as filters, which includes both the cache item data
 * and optionally the bucket measure local identifier (for metrics from the bucket).
 */
export type IAddFilterItem = ICacheItem & { bucketItemLocalIdentifier?: string };

export const toMetricCacheItems = (
    items: Array<IDimensionalityItem | IMetricPickerItemPayload>,
): IAddFilterItem[] => {
    return items
        .filter((item): item is IMetricPickerItemPayload => item.type === "metric")
        .map((item) => ({
            type: "metric" as const,
            ref: item.ref,
            identifier: item.identifier,
            uri: item.uri ?? "",
            title: item.title,
            summary: item.summary,
            expression: item.expression,
            bucketItemLocalIdentifier: item.bucketItemLocalIdentifier,
        }));
};

export type RankingFilterDisabledReason = "existing" | "notSupported" | "missingItems" | "measureValueFilter";

/**
 * Determines the reason why the ranking filter is disabled.
 * Returns undefined if the ranking filter is enabled.
 *
 * The "missing items" and "measure value filter" blockers are independent and are each lifted only by
 * their own feature flag, so neither can mask the other:
 * 1. hasRankingFilter - already exists
 * 2. !isRankingFilterSupported - backend doesn't support it
 * 3. missing items in the visualization - with enableImprovedRankingFilter the ranked metric AND the
 *    "out of" attributes can be picked from the catalog, so neither a bucket measure nor a slicing
 *    attribute is required; without it, both are required.
 * 4. hasActiveMeasureValueFilter - conflicts with measure value filter; lifted only by enableRankingWithMvf
 */
export const getRankingFilterDisabledReason = (
    isRankingFilterSupported: boolean,
    hasMeasures: boolean,
    hasAttributes: boolean,
    hasRankingFilter: boolean,
    hasActiveMeasureValueFilter: boolean,
    enableImprovedRankingFilter = false,
    enableRankingWithMvf = false,
): RankingFilterDisabledReason | undefined => {
    if (hasRankingFilter) {
        return "existing";
    }
    if (!isRankingFilterSupported) {
        return "notSupported";
    }
    // With the improved ranking filter the ranked metric and the "out of" attributes can both be picked
    // from the catalog, so the insight need not contain a measure or an attribute of its own.
    const isMissingMeasure = !hasMeasures && !enableImprovedRankingFilter;
    const isMissingAttribute = !hasAttributes && !enableImprovedRankingFilter;
    if (isMissingMeasure || isMissingAttribute) {
        return "missingItems";
    }
    if (hasActiveMeasureValueFilter && !enableRankingWithMvf) {
        return "measureValueFilter";
    }
    return undefined;
};

const RANKING_DISABLED_TOOLTIP_KEYS: Record<RankingFilterDisabledReason, string> = {
    existing: defineMessage({ id: "filter_bar_dropdown.ranking_filter.item.disabled_existing.tooltip" }).id,
    notSupported: defineMessage({
        id: "filter_bar_dropdown.ranking_filter.item.disabled_not_supported.tooltip",
    }).id,
    missingItems: defineMessage({
        id: "filter_bar_dropdown.ranking_filter.item.disabled_missing_items.tooltip",
    }).id,
    measureValueFilter: defineMessage({
        id: "filter_bar_dropdown.ranking_filter.item.disabled_with_measure_value_filter.tooltip",
    }).id,
};

/**
 * Returns the translation key for the ranking filter disabled tooltip.
 * Returns undefined if ranking is enabled (no tooltip needed).
 */
export const getRankingDisabledTooltipKey = (
    disabledReason: RankingFilterDisabledReason | undefined,
): string | undefined => {
    if (!disabledReason) {
        return undefined;
    }
    return RANKING_DISABLED_TOOLTIP_KEYS[disabledReason];
};
