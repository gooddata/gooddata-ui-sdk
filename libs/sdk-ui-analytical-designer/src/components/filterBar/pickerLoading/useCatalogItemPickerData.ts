// (C) 2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";

import {
    type CatalogItem,
    type IAttributeOrMeasure,
    type ICatalogAttribute,
    type ICatalogComputedAttribute,
    type ICatalogGroup as ICatalogGroupModel,
    type IInsightDefinition,
    type ObjRef,
    idRef,
    insightAttributes,
    insightMeasures,
    isCatalogAttribute,
    isCatalogComputedAttribute,
    objRefToString,
} from "@gooddata/sdk-model";
import { type IDimensionalityItem } from "@gooddata/sdk-ui-filters";
import {
    type IBucketItemDescriptors,
    type ICatalogGroup as ICatalogGroupPicker,
    type ICatalogItemPickerItem,
    type ICatalogItemPickerItems,
} from "@gooddata/sdk-ui-kit";

import { enableComputedAttributes } from "../../../selectors/feature_flag_selector.js";
import {
    type IAttributeFilter,
    type IMeasureValueFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IRawBucketItems } from "../../../typings/buckets.js";
import { type ICatalogEntries } from "../../../typings/state_objects.js";
import { loadValidDimensionalityAttributes } from "../../../utils/api.js";
import {
    type IMetricPickerItemPayload,
    getAvailableInsightAttributeItems,
    getBucketMeasureIdentifiers,
    getBucketMetricItems,
    getCatalogMeasures,
    getFilteredAttributeRefKeys,
    getFilteredMeasureIdentifiers,
    getFilteredMeasureRefKeys,
    getMetricCacheItemsById,
    isAttributeRefFiltered,
    toAttributePickerItems,
} from "../filterBarDropdown/filterBarDropdownUtils.js";
import { type ValidAttributesMap, buildAttributeCatalogItems } from "../measure_value_filter_item_utils.js";

export type CatalogItemPickerItemType = "attribute" | "metric";

interface IUseCatalogItemPickerDataParams {
    itemTypes: CatalogItemPickerItemType[];
    isOpen: boolean;
    isCatalogLoading: boolean;

    projectId: string;
    insight: IInsightDefinition | undefined;
    datasetId: string | undefined;
    includeObjectsWithTags?: ObjRef[];
    excludeObjectsWithTags?: ObjRef[];

    availableCatalogItems: ReadonlyArray<CatalogItem>;
    allCatalogItems: ReadonlyArray<CatalogItem>;
    catalogGroups: ReadonlyArray<ICatalogGroupModel>;

    bucketMeasures: IRawBucketItems;
    bucketAttributes: IRawBucketItems;
    bucketItemNames: IBucketItemDescriptors;
    itemCache: ICatalogEntries;

    attributeFilters: ReadonlyArray<IAttributeFilter>;
    measureValueFilters: ReadonlyArray<IMeasureValueFilter>;

    /**
     * Optional override of items used for attribute availability (computeValidObjects).
     * When not provided, defaults to measures + attributes from the current insight.
     */
    attributeAvailabilityItems?: IAttributeOrMeasure[];
}

interface IUseCatalogItemPickerDataResult {
    attributePickerItems: ICatalogItemPickerItems<IDimensionalityItem> | undefined;
    metricPickerItems: ICatalogItemPickerItems<IMetricPickerItemPayload> | undefined;
    groups: ICatalogGroupPicker[] | undefined;
    isLoading: boolean;
}

const getAttributeItemId = (item: IDimensionalityItem): string => objRefToString(item.identifier);

const buildAvailabilityItems = (insight: IInsightDefinition): IAttributeOrMeasure[] => {
    return [...insightMeasures(insight), ...insightAttributes(insight)];
};

type AttributeLikeCatalogItem = ICatalogAttribute | ICatalogComputedAttribute;

/**
 * Computed attributes are filterable exactly like regular attributes, so every path that offers
 * catalog attributes to the picker must accept both. The catalog only contains computed attributes
 * while the feature flag is on (the catalog load is gated), so no extra gating is needed here.
 */
const isAttributeLikeCatalogItem = (item: CatalogItem): item is AttributeLikeCatalogItem =>
    isCatalogAttribute(item) || isCatalogComputedAttribute(item);

const catalogItemToDimensionalityItem = (item: AttributeLikeCatalogItem): IDimensionalityItem => {
    const metadata = isCatalogComputedAttribute(item) ? item.computedAttribute : item.attribute;
    const dataSet = isCatalogComputedAttribute(item)
        ? item.computedAttribute.dataSet
        : (item.dataSet ?? item.attribute.dataSet);

    return {
        identifier: item.defaultDisplayForm.ref,
        ref: item.defaultDisplayForm.ref,
        title: metadata.title,
        type: "attribute" as const,
        dataset: dataSet
            ? {
                  identifier: dataSet.ref,
                  title: dataSet.title,
              }
            : undefined,
    };
};

const buildFallbackCatalogItems = ({
    itemCache,
    availableCatalogItems,
    allCatalogItems,
}: {
    itemCache: ICatalogEntries;
    availableCatalogItems: ReadonlyArray<CatalogItem>;
    allCatalogItems: ReadonlyArray<CatalogItem>;
}): IDimensionalityItem[] => {
    const catalogAttributes = (
        availableCatalogItems.length > 0 ? availableCatalogItems : allCatalogItems
    ).filter(isAttributeLikeCatalogItem);

    if (catalogAttributes.length > 0) {
        return catalogAttributes.map(catalogItemToDimensionalityItem);
    }

    const result: IDimensionalityItem[] = [];
    Object.values(itemCache).forEach((cacheItem) => {
        if (cacheItem.type !== "attribute" && cacheItem.type !== "computedAttribute") {
            return;
        }
        const dfRef = cacheItem.dfRef ?? cacheItem.ref;
        if (!dfRef) {
            return;
        }
        result.push({
            identifier: dfRef,
            ref: dfRef,
            title: cacheItem.title,
            type: "attribute",
            dataset: undefined,
        });
    });
    return result;
};

const buildCatalogAttributeItems = (
    catalogAttributes: ReadonlyArray<AttributeLikeCatalogItem>,
): IDimensionalityItem[] => {
    return catalogAttributes.map(catalogItemToDimensionalityItem);
};

export function useCatalogItemPickerData({
    itemTypes,
    isOpen,
    isCatalogLoading,
    projectId,
    insight,
    datasetId,
    includeObjectsWithTags,
    excludeObjectsWithTags,
    availableCatalogItems,
    allCatalogItems,
    catalogGroups,
    bucketMeasures,
    bucketAttributes,
    bucketItemNames,
    itemCache,
    attributeFilters,
    measureValueFilters,
    attributeAvailabilityItems,
}: IUseCatalogItemPickerDataParams): IUseCatalogItemPickerDataResult {
    const includesAttributes = itemTypes.includes("attribute");
    const includesMetrics = itemTypes.includes("metric");
    const computedAttributesEnabled = useSelector(enableComputedAttributes);

    const [catalogAttributeItems, setCatalogAttributeItems] = useState<IDimensionalityItem[]>([]);
    const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);

    useEffect(() => {
        let canceled = false;
        const cleanup = () => {
            canceled = true;
        };

        if (!isOpen || !includesAttributes) {
            setIsLoadingAttributes(false);
            return cleanup;
        }

        const availabilityItems =
            attributeAvailabilityItems ?? (insight ? buildAvailabilityItems(insight) : []);
        const catalogAttributes = (
            availableCatalogItems.length > 0 ? availableCatalogItems : allCatalogItems
        ).filter(isAttributeLikeCatalogItem);

        // No availability request -> show catalog attributes (best effort dataset) or cache fallback.
        if (availabilityItems.length === 0) {
            if (catalogAttributes.length > 0) {
                setCatalogAttributeItems(buildCatalogAttributeItems(catalogAttributes));
            } else {
                setCatalogAttributeItems(
                    buildFallbackCatalogItems({
                        itemCache,
                        availableCatalogItems,
                        allCatalogItems,
                    }),
                );
            }
            setIsLoadingAttributes(false);
            return cleanup;
        }

        // Availability (computeValidObjects) -> use validated list, fall back to catalog/cache if empty.
        setIsLoadingAttributes(true);
        loadValidDimensionalityAttributes(projectId, {
            items: availabilityItems,
            includeObjectsWithTags,
            excludeObjectsWithTags,
            dataSetIdentifier: datasetId ? idRef(datasetId) : undefined,
            enableComputedAttributes: computedAttributesEnabled,
        })
            .then((validAttributesMap: ValidAttributesMap) => {
                if (canceled) {
                    return;
                }
                const items = buildAttributeCatalogItems(validAttributesMap);
                setCatalogAttributeItems(
                    items.length > 0
                        ? items
                        : buildFallbackCatalogItems({
                              itemCache,
                              availableCatalogItems,
                              allCatalogItems,
                          }),
                );
            })
            .catch(() => {
                if (canceled) {
                    return;
                }
                setCatalogAttributeItems(
                    buildFallbackCatalogItems({
                        itemCache,
                        availableCatalogItems,
                        allCatalogItems,
                    }),
                );
            })
            .finally(() => {
                if (!canceled) {
                    setIsLoadingAttributes(false);
                }
            });

        return cleanup;
    }, [
        allCatalogItems,
        attributeAvailabilityItems,
        datasetId,
        excludeObjectsWithTags,
        includeObjectsWithTags,
        includesAttributes,
        insight,
        isOpen,
        itemCache,
        availableCatalogItems,
        projectId,
        computedAttributesEnabled,
    ]);

    // Attribute picker items (mapped to CatalogItemPicker items)
    const filteredAttributeRefKeys = useMemo(
        () => getFilteredAttributeRefKeys(attributeFilters, itemCache),
        [attributeFilters, itemCache],
    );

    const availableInsightAttributeItems = useMemo(
        () => getAvailableInsightAttributeItems(bucketAttributes, bucketItemNames, filteredAttributeRefKeys),
        [bucketAttributes, bucketItemNames, filteredAttributeRefKeys],
    );

    const availableCatalogAttributeItems = useMemo(() => {
        return catalogAttributeItems.filter(
            (item) => !isAttributeRefFiltered(filteredAttributeRefKeys, item.identifier),
        );
    }, [catalogAttributeItems, filteredAttributeRefKeys]);

    const attributePickerItems = useMemo(
        (): ICatalogItemPickerItems<IDimensionalityItem> | undefined =>
            includesAttributes
                ? toAttributePickerItems(
                      availableInsightAttributeItems,
                      availableCatalogAttributeItems,
                      getAttributeItemId,
                  )
                : undefined,
        [includesAttributes, availableCatalogAttributeItems, availableInsightAttributeItems],
    );

    // Metric picker items (pure mapping; no extra network)
    const metricCacheItemsById = useMemo(() => getMetricCacheItemsById(itemCache), [itemCache]);
    const bucketMeasureIdentifiers = useMemo(
        () => getBucketMeasureIdentifiers(bucketMeasures),
        [bucketMeasures],
    );
    const filteredMeasureRefKeys = useMemo(
        () => getFilteredMeasureRefKeys(bucketMeasures, measureValueFilters),
        [bucketMeasures, measureValueFilters],
    );
    const filteredMeasureIdentifiers = useMemo(
        () => getFilteredMeasureIdentifiers(bucketMeasures, measureValueFilters),
        [bucketMeasures, measureValueFilters],
    );
    const bucketMetricItems = useMemo(
        () =>
            getBucketMetricItems(bucketMeasures, bucketItemNames, measureValueFilters, metricCacheItemsById),
        [bucketMeasures, bucketItemNames, measureValueFilters, metricCacheItemsById],
    );
    const catalogMeasures = useMemo(
        () =>
            getCatalogMeasures(
                availableCatalogItems,
                bucketMeasureIdentifiers,
                filteredMeasureIdentifiers,
                filteredMeasureRefKeys,
            ),
        [availableCatalogItems, bucketMeasureIdentifiers, filteredMeasureIdentifiers, filteredMeasureRefKeys],
    );

    const metricPickerItems = useMemo((): ICatalogItemPickerItems<IMetricPickerItemPayload> | undefined => {
        if (!includesMetrics) {
            return undefined;
        }
        const insightItems: ICatalogItemPickerItem<IMetricPickerItemPayload>[] = bucketMetricItems.map(
            (item) => ({
                id: item.id,
                title: item.title,
                type: "metric",
                payload: item.payload,
                sequenceNumber: item.sequenceNumber,
            }),
        );
        const catalogItemsList: ICatalogItemPickerItem<IMetricPickerItemPayload>[] = catalogMeasures.map(
            (item) => ({
                id: item.id,
                title: item.title,
                type: "metric",
                payload: item.payload,
                groupIds: item.groups.map((group) => objRefToString(group)),
            }),
        );
        return { insightItems, catalogItems: catalogItemsList };
    }, [includesMetrics, bucketMetricItems, catalogMeasures]);

    // Groups for metrics
    const groups = useMemo(
        (): ICatalogGroupPicker[] | undefined =>
            includesMetrics
                ? catalogGroups.map((group) => ({
                      id: objRefToString(group.tag),
                      title: group.title,
                  }))
                : undefined,
        [includesMetrics, catalogGroups],
    );

    const isLoading = (includesAttributes && isLoadingAttributes) || (isOpen && isCatalogLoading);

    return {
        attributePickerItems,
        metricPickerItems,
        groups,
        isLoading,
    };
}
