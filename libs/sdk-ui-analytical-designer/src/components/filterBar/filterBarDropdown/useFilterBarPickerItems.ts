// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type CatalogItem,
    type ICatalogGroup as ICatalogGroupModel,
    objRefToString,
} from "@gooddata/sdk-model";
import { type IDimensionalityItem } from "@gooddata/sdk-ui-filters";
import {
    type IBucketItemDescriptors,
    type ICatalogGroup as ICatalogGroupPicker,
    type ICatalogItemPickerItem,
    type ICatalogItemPickerItems,
} from "@gooddata/sdk-ui-kit";

import {
    type IAttributeFilter,
    type IMeasureValueFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IRawBucketItems } from "../../../typings/buckets.js";
import { type ICatalogEntries } from "../../../typings/state_objects.js";

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
} from "./filterBarDropdownUtils.js";

export type FilterBarPickerItemType = "attribute" | "metric";

interface IUseFilterBarPickerItemsParams {
    itemTypes: FilterBarPickerItemType[];
    bucketMeasures: IRawBucketItems;
    bucketAttributes: IRawBucketItems;
    bucketItemNames: IBucketItemDescriptors;
    itemCache: ICatalogEntries;
    attributeFilters: ReadonlyArray<IAttributeFilter>;
    measureValueFilters: ReadonlyArray<IMeasureValueFilter>;
    availableCatalogItems: ReadonlyArray<CatalogItem>;
    catalogGroups: ReadonlyArray<ICatalogGroupModel>;
    catalogItems: IDimensionalityItem[];
}

interface IUseFilterBarPickerItemsResult {
    attributePickerItems: ICatalogItemPickerItems<IDimensionalityItem> | undefined;
    metricPickerItems: ICatalogItemPickerItems<IMetricPickerItemPayload> | undefined;
    groups: ICatalogGroupPicker[] | undefined;
}

const getItemId = (item: IDimensionalityItem): string => {
    return objRefToString(item.identifier);
};

export function useFilterBarPickerItems({
    itemTypes,
    bucketMeasures,
    bucketAttributes,
    bucketItemNames,
    itemCache,
    attributeFilters,
    measureValueFilters,
    availableCatalogItems,
    catalogGroups,
    catalogItems,
}: IUseFilterBarPickerItemsParams): IUseFilterBarPickerItemsResult {
    const includesAttributes = itemTypes.includes("attribute");
    const includesMetrics = itemTypes.includes("metric");

    // Attribute picker items
    const filteredAttributeRefKeys = useMemo(
        () => getFilteredAttributeRefKeys(attributeFilters, itemCache),
        [attributeFilters, itemCache],
    );

    const availableInsightItems = useMemo(
        () => getAvailableInsightAttributeItems(bucketAttributes, bucketItemNames, filteredAttributeRefKeys),
        [bucketAttributes, bucketItemNames, filteredAttributeRefKeys],
    );

    const availableCatalogAttributeItems = useMemo(() => {
        return catalogItems.filter(
            (item) => !isAttributeRefFiltered(filteredAttributeRefKeys, item.identifier),
        );
    }, [catalogItems, filteredAttributeRefKeys]);

    const attributePickerItems = useMemo(
        (): ICatalogItemPickerItems<IDimensionalityItem> | undefined =>
            includesAttributes
                ? toAttributePickerItems(availableInsightItems, availableCatalogAttributeItems, getItemId)
                : undefined,
        [includesAttributes, availableCatalogAttributeItems, availableInsightItems],
    );

    // Metric picker items
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

    // Groups (only when metrics are included)
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

    return {
        attributePickerItems,
        metricPickerItems,
        groups,
    };
}
