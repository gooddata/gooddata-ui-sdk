// (C) 2022-2026 GoodData Corporation

import { type LocalIdMap, Normalizer } from "@gooddata/sdk-backend-base";
import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IFilter,
    type IInsightDefinition,
    type IInsightLayerDefinition,
    type ILocatorItem,
    type IMeasure,
    type ObjRefInScope,
    type VisualizationProperties,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketItems,
    bucketTotals,
    defWithFilters,
    insightBuckets,
    insightFilters,
    insightLayers,
    insightProperties,
    insightSetBuckets,
    insightSetFilters,
    insightSetLayers,
    insightSetProperties,
    insightSetSorts,
    insightSorts,
    isAttribute,
    isAttributeLocator,
    isAttributeSort,
    isLocalIdRef,
    isMeasure,
    isMeasureLocator,
    isMeasureSort,
    isMeasureValueFilter,
    isRankingFilter,
    isTotalLocator,
    localIdRef,
    measureItem,
    measureLocalId,
    newBucket,
    newDefForBuckets,
    newTotal,
    serializeObjRef,
} from "@gooddata/sdk-model";

function normalizeProperties(
    properties: VisualizationProperties,
    o2nMap: LocalIdMap,
): VisualizationProperties {
    // do simple search/replace of all the original items
    const stringified = JSON.stringify(properties);

    const replaced = Object.entries(o2nMap).reduce((acc, [original, normalized]) => {
        const regex = new RegExp(original, "g");
        return acc.replace(regex, normalized);
    }, stringified);

    return JSON.parse(replaced);
}

/**
 * Creates an insight that has reasonable local ids instead of potentially long illegible ones in the original insight.
 *
 * @privateRemarks
 * Makes use of the {@link @gooddata/sdk-backed-base#Normalizer} to do most of the work.
 *
 * @param insight - the insight to "normalize"
 * @returns always a new instance
 * @internal
 */
export function normalizeInsight(insight: IInsightDefinition): IInsightDefinition {
    const originalFilters = insightFilters(insight);
    const { safeFilters, measureBasedFilters } = splitMeasureBasedFilters(originalFilters);

    const { attributes, measures } = collectUniqueItems(insight);

    const syntheticBuckets = [
        ...(attributes.length ? [newBucket("attributes", ...attributes)] : []),
        ...(measures.length ? [newBucket("measures", ...measures)] : []),
    ];

    // Normalize local ids across root buckets and all insight layers.
    // We only feed “safe” filters to the normalizer to avoid throwing on dangling localIdRefs in MVF/ranking.
    const execution = defWithFilters(newDefForBuckets("foo", syntheticBuckets), safeFilters);
    const { n2oMap, normalized } = Normalizer.normalize(execution, { keepRemovableProperties: true });

    const o2nMap: LocalIdMap = Object.fromEntries(
        Object.entries(n2oMap).map(([normalized, original]) => [original, normalized]),
    );

    const processedBuckets = normalizeBuckets(
        insightBuckets(insight),
        o2nMap,
        normalized.attributes,
        normalized.measures,
    );
    const processedLayers = normalizeLayers(
        insightLayers(insight),
        o2nMap,
        normalized.attributes,
        normalized.measures,
    );

    const properties = insightProperties(insight);
    const processedProperties = properties && normalizeProperties(properties, o2nMap);

    const processedSorts = normalizeSorts(insightSorts(insight), o2nMap);

    const normalizedMeasureBasedFilters = measureBasedFilters.map((f) => normalizeFilterLocalIds(f, o2nMap));
    const mergedFilters = mergeFiltersPreservingOrder(
        originalFilters,
        normalized.filters,
        normalizedMeasureBasedFilters,
    );

    return insightSetProperties(
        insightSetSorts(
            insightSetLayers(
                insightSetFilters(insightSetBuckets(insight, processedBuckets), mergedFilters),
                processedLayers,
            ),
            processedSorts,
        ),
        processedProperties,
    );
}

function normalizeBuckets(
    buckets: ReturnType<typeof insightBuckets>,
    o2nMap: LocalIdMap,
    normalizedAttributes: IAttribute[],
    normalizedMeasures: IMeasure[],
): ReturnType<typeof insightBuckets> {
    return buckets.map((originalBucket) => {
        // put back stuff deleted by the normalizer
        const processedItems = bucketItems(originalBucket).map((originalBucketItem) => {
            if (isAttribute(originalBucketItem)) {
                const normalizedId = o2nMap[attributeLocalId(originalBucketItem)];
                return normalizedAttributes.find((attr) => attributeLocalId(attr) === normalizedId);
            } else {
                const normalizedId = o2nMap[measureLocalId(originalBucketItem)];
                return normalizedMeasures.find((measure) => measureLocalId(measure) === normalizedId);
            }
        });

        const processedTotals = bucketTotals(originalBucket).map((originalTotal) => {
            const { attributeIdentifier, measureIdentifier, type, alias } = originalTotal;
            return newTotal(type, o2nMap[measureIdentifier], o2nMap[attributeIdentifier], alias);
        });

        return newBucket(originalBucket.localIdentifier!, ...processedItems, ...processedTotals);
    });
}

function splitMeasureBasedFilters(filters: IFilter[]): {
    safeFilters: IFilter[];
    measureBasedFilters: IFilter[];
} {
    const safeFilters: IFilter[] = [];
    const measureBasedFilters: IFilter[] = [];

    for (const filter of filters) {
        if (isMeasureValueFilter(filter) || isRankingFilter(filter)) {
            measureBasedFilters.push(filter);
        } else {
            safeFilters.push(filter);
        }
    }

    return { safeFilters, measureBasedFilters };
}

function mergeFiltersPreservingOrder(
    originalFilters: IFilter[],
    normalizedSafeFilters: IFilter[],
    normalizedMeasureBasedFilters: IFilter[],
): IFilter[] {
    let safeFilterIdx = 0;
    let measureFilterIdx = 0;
    return originalFilters.map((filter) => {
        if (isMeasureValueFilter(filter) || isRankingFilter(filter)) {
            const normalized = normalizedMeasureBasedFilters[measureFilterIdx] ?? filter;
            measureFilterIdx += 1;
            return normalized;
        }

        const normalized = normalizedSafeFilters[safeFilterIdx];
        safeFilterIdx += 1;
        return normalized;
    });
}

function normalizeFilterLocalIds(filter: IFilter, o2nMap: LocalIdMap): IFilter {
    if (isMeasureValueFilter(filter)) {
        return normalizeMeasureValueFilterLocalIds(filter, o2nMap);
    }

    if (isRankingFilter(filter)) {
        return normalizeRankingFilterLocalIds(filter, o2nMap);
    }

    return filter;
}

function normalizeMeasureValueFilterLocalIds(filter: IFilter, o2nMap: LocalIdMap): IFilter {
    if (!isMeasureValueFilter(filter)) {
        return filter;
    }

    const mappedMeasure = mapLocalIdRef(filter.measureValueFilter.measure, o2nMap);
    const mappedDimensionality = mapOptionalLocalIdRefs(filter.measureValueFilter.dimensionality, o2nMap);

    return {
        measureValueFilter: {
            ...filter.measureValueFilter,
            measure: mappedMeasure,
            ...(mappedDimensionality ? { dimensionality: mappedDimensionality } : {}),
        },
    };
}

function normalizeRankingFilterLocalIds(filter: IFilter, o2nMap: LocalIdMap): IFilter {
    if (!isRankingFilter(filter)) {
        return filter;
    }

    const mappedMeasure = mapLocalIdRef(filter.rankingFilter.measure, o2nMap);
    const mappedAttributes = mapOptionalLocalIdRefs(filter.rankingFilter.attributes, o2nMap);

    return {
        rankingFilter: {
            ...filter.rankingFilter,
            measure: mappedMeasure,
            ...(mappedAttributes ? { attributes: mappedAttributes } : {}),
        },
    };
}

function mapLocalIdRef(ref: ObjRefInScope, o2nMap: LocalIdMap): ObjRefInScope {
    if (!isLocalIdRef(ref)) {
        return ref;
    }

    const mapped = o2nMap[ref.localIdentifier];
    if (!mapped) {
        return ref;
    }

    return localIdRef(mapped);
}

function mapOptionalLocalIdRefs(
    refs: ObjRefInScope[] | undefined,
    o2nMap: LocalIdMap,
): ObjRefInScope[] | undefined {
    if (!refs) {
        return undefined;
    }

    return refs.map((ref) => mapLocalIdRef(ref, o2nMap));
}

function normalizeSorts(
    sorts: ReturnType<typeof insightSorts>,
    o2nMap: LocalIdMap,
): ReturnType<typeof insightSorts> {
    const mapId = (id: string): string => o2nMap[id] ?? id;

    return sorts.map((sort) => {
        if (isAttributeSort(sort)) {
            const id = sort.attributeSortItem.attributeIdentifier;
            return {
                attributeSortItem: {
                    ...sort.attributeSortItem,
                    attributeIdentifier: mapId(id),
                },
            };
        }

        if (isMeasureSort(sort)) {
            return {
                measureSortItem: {
                    ...sort.measureSortItem,
                    locators: sort.measureSortItem.locators.map((locator) =>
                        normalizeMeasureSortLocatorLocalIds(locator, mapId),
                    ),
                },
            };
        }

        return sort;
    });
}

function normalizeMeasureSortLocatorLocalIds(
    locator: ILocatorItem,
    mapId: (id: string) => string,
): ILocatorItem {
    if (isAttributeLocator(locator)) {
        const id = locator.attributeLocatorItem.attributeIdentifier;
        return {
            attributeLocatorItem: {
                ...locator.attributeLocatorItem,
                attributeIdentifier: mapId(id),
            },
        };
    }

    if (isTotalLocator(locator)) {
        const id = locator.totalLocatorItem.attributeIdentifier;
        return {
            totalLocatorItem: {
                ...locator.totalLocatorItem,
                attributeIdentifier: mapId(id),
            },
        };
    }

    if (isMeasureLocator(locator)) {
        const id = locator.measureLocatorItem.measureIdentifier;
        return {
            measureLocatorItem: {
                ...locator.measureLocatorItem,
                measureIdentifier: mapId(id),
            },
        };
    }

    return locator;
}

function normalizeLayers(
    layers: IInsightLayerDefinition[],
    o2nMap: LocalIdMap,
    normalizedAttributes: IAttribute[],
    normalizedMeasures: IMeasure[],
): IInsightLayerDefinition[] {
    return layers.map((layer) => ({
        ...layer,
        buckets: normalizeBuckets(layer.buckets, o2nMap, normalizedAttributes, normalizedMeasures),
        ...(layer.sorts ? { sorts: normalizeSorts(layer.sorts, o2nMap) } : {}),
        ...(layer.filters ? { filters: layer.filters.map((f) => normalizeFilterLocalIds(f, o2nMap)) } : {}),
        ...(layer.properties ? { properties: normalizeProperties(layer.properties, o2nMap) } : {}),
    }));
}

function collectUniqueItems(insight: IInsightDefinition): { attributes: IAttribute[]; measures: IMeasure[] } {
    const attributes: IAttribute[] = [];
    const measures: IMeasure[] = [];
    const attributesByLocalId = new Map<string, string>();
    const measuresByLocalId = new Map<string, string>();

    const register = createUniqueItemRegistrar({
        attributes,
        measures,
        attributesByLocalId,
        measuresByLocalId,
    });

    forEachInsightBucketItem(insight, register);

    return { attributes, measures };
}

function forEachInsightBucketItem(
    insight: IInsightDefinition,
    onItem: (item: IAttributeOrMeasure) => void,
): void {
    for (const bucket of insightBuckets(insight)) {
        for (const item of bucketItems(bucket)) {
            onItem(item);
        }
    }

    for (const layer of insightLayers(insight)) {
        for (const bucket of layer.buckets) {
            for (const item of bucketItems(bucket)) {
                onItem(item);
            }
        }
    }
}

function createUniqueItemRegistrar(ctx: {
    attributes: IAttribute[];
    measures: IMeasure[];
    attributesByLocalId: Map<string, string>;
    measuresByLocalId: Map<string, string>;
}): (item: IAttributeOrMeasure) => void {
    const registerAttribute = (item: IAttribute): void => {
        const id = attributeLocalId(item);
        const refKey = serializeObjRef(attributeDisplayFormRef(item));
        registerUniqueItem(
            ctx.attributesByLocalId,
            id,
            refKey,
            item,
            ctx.attributes,
            `Conflicting attribute localId '${id}' across insight/layer buckets.`,
        );
    };

    const registerMeasure = (item: IMeasure): void => {
        const id = measureLocalId(item);
        const itemRef = measureItem(item);
        const refKey = itemRef ? serializeObjRef(itemRef) : "undefined";
        registerUniqueItem(
            ctx.measuresByLocalId,
            id,
            refKey,
            item,
            ctx.measures,
            `Conflicting measure localId '${id}' across insight/layer buckets.`,
        );
    };

    return (item: IAttributeOrMeasure): void => {
        if (isAttribute(item)) {
            registerAttribute(item);
        } else if (isMeasure(item)) {
            registerMeasure(item);
        }
    };
}

function registerUniqueItem<T>(
    byLocalId: Map<string, string>,
    localId: string,
    refKey: string,
    item: T,
    out: T[],
    conflictMessage: string,
): void {
    const existing = byLocalId.get(localId);
    if (existing && existing !== refKey) {
        throw new Error(conflictMessage);
    }

    if (!existing) {
        byLocalId.set(localId, refKey);
        out.push(item);
    }
}
