// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import {
    type CatalogItem,
    type ICatalogGroup as ICatalogGroupModel,
    type IInsightDefinition,
    type ObjRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { type IDimensionalityItem } from "@gooddata/sdk-ui-filters";
import {
    CatalogItemPicker,
    CatalogItemPickerContent,
    type IBucketItemDescriptors,
    type ICatalogItemPickerItem,
    type ICatalogItemPickerProps,
} from "@gooddata/sdk-ui-kit";

import {
    type IAttributeFilter,
    type IMeasureValueFilter,
} from "../../../store/filter_bar/filter_bar_types.js";
import { type IRawBucketItems } from "../../../typings/buckets.js";
import { type ICatalogEntries } from "../../../typings/state_objects.js";
import { CatalogDetailsBubble } from "../../catalog/item/CatalogDetailsBubble.js";
import { useCatalogItemPickerData } from "../pickerLoading/useCatalogItemPickerData.js";

import {
    type IAddFilterItem,
    type IMetricPickerItemPayload,
    getCacheItemByRef,
    toAttributeCacheItems,
    toMetricCacheItems,
} from "./filterBarDropdownUtils.js";
import { type FilterBarPickerItemType } from "./useFilterBarPickerItems.js";

/** What this component feeds the picker, and therefore what the picker hands back. */
type FilterBarPickerPayload = IDimensionalityItem | IMetricPickerItemPayload | IAddFilterItem;

interface IFilterBarCatalogItemPickerProps {
    itemTypes: FilterBarPickerItemType[];
    isOpen: boolean;
    /**
     * Selection mode for the picker. Defaults to "multiple" (e.g. measure value filters allow picking
     * several metrics at once). Ranking filter picks a single ranked metric, so it uses "single".
     */
    selectionMode?: "single" | "multiple";
    /**
     * Whether to render the full picker including its header. Defaults to true. Set to false to render
     * only the picker body (search + grouped list), e.g. when the picker is embedded under an external
     * anchor button such as the ranking filter measure dropdown.
     */
    withHeader?: boolean;
    maxListHeight: number;
    onBack: () => void;
    onClose: () => void;
    onAdd: (items: IAddFilterItem[]) => void;
    bucketMeasures: IRawBucketItems;
    bucketAttributes: IRawBucketItems;
    bucketItemNames: IBucketItemDescriptors;
    itemCache: ICatalogEntries;
    attributeFilters: ReadonlyArray<IAttributeFilter>;
    measureValueFilters: ReadonlyArray<IMeasureValueFilter>;
    availableCatalogItems: ReadonlyArray<CatalogItem>;
    allCatalogItems: ReadonlyArray<CatalogItem>;
    catalogGroups: ReadonlyArray<ICatalogGroupModel>;
    projectId: string;
    insight: IInsightDefinition | undefined;
    datasetId: string | undefined;
    includeObjectsWithTags?: ObjRef[];
    excludeObjectsWithTags?: ObjRef[];
    isCatalogLoading: boolean;
}

export function FilterBarCatalogItemPicker({
    itemTypes,
    isOpen,
    selectionMode = "multiple",
    withHeader = true,
    maxListHeight,
    onBack,
    onClose,
    onAdd,
    bucketMeasures,
    bucketAttributes,
    bucketItemNames,
    itemCache,
    attributeFilters,
    measureValueFilters,
    availableCatalogItems,
    allCatalogItems,
    catalogGroups,
    projectId,
    insight,
    datasetId,
    includeObjectsWithTags,
    excludeObjectsWithTags,
    isCatalogLoading,
}: IFilterBarCatalogItemPickerProps) {
    const includesAttributes = itemTypes.includes("attribute");
    const includesMetrics = itemTypes.includes("metric");

    const {
        attributePickerItems,
        metricPickerItems,
        groups,
        isLoading: isPickerLoading,
    } = useCatalogItemPickerData({
        itemTypes,
        isOpen,
        isCatalogLoading,
        bucketMeasures,
        bucketAttributes,
        bucketItemNames,
        itemCache,
        attributeFilters,
        measureValueFilters,
        availableCatalogItems,
        allCatalogItems,
        catalogGroups,
        projectId,
        insight,
        datasetId,
        includeObjectsWithTags,
        excludeObjectsWithTags,
    });

    const cacheItemByRef = useMemo(() => getCacheItemByRef(itemCache), [itemCache]);

    // Unified handler that can process items of different types.
    // Each item has a `type` field that determines how it should be converted.
    const handleAddItems = useCallback(
        (items: unknown[]) => {
            // the picker declares its payloads as `unknown`; what it hands back is what it was given
            const pickedItems = items as FilterBarPickerPayload[];
            const attributeItems = pickedItems.filter(
                (item): item is IDimensionalityItem => item.type === "attribute",
            );
            const metricItems = pickedItems.filter(
                (item): item is IMetricPickerItemPayload => item.type === "metric",
            );

            const convertedItems: IAddFilterItem[] = [
                ...(toAttributeCacheItems(attributeItems, cacheItemByRef) as IAddFilterItem[]),
                ...toMetricCacheItems(metricItems),
            ];

            onAdd(convertedItems);
        },
        [cacheItemByRef, onAdd],
    );

    // In single-select mode the picker reports the picked item through onSelect (not onAdd),
    // so route it through the same conversion as a one-item add.
    const handleSelectItem = useCallback(
        (item: unknown) => {
            handleAddItems([item]);
        },
        [handleAddItems],
    );

    const renderItemDetails = useCallback(
        (item: ICatalogItemPickerItem<IDimensionalityItem | IMetricPickerItemPayload>) => {
            const { payload } = item;
            if (payload.type === "metric") {
                // the metric payload already carries what the bubble needs (type, ref, identifier, title)
                return <CatalogDetailsBubble item={payload} />;
            }
            const ref = payload.ref ?? item.ref;
            const entry = ref ? cacheItemByRef.get(serializeObjRef(ref)) : undefined;
            return entry ? <CatalogDetailsBubble item={entry} /> : null;
        },
        [cacheItemByRef],
    );

    // Map itemTypes to CatalogItemPicker types
    const pickerItemTypes = useMemo(() => {
        return itemTypes.map((type) => {
            // Direct mapping for now, can be extended for future types
            return type;
        });
    }, [itemTypes]);

    const pickerProps: ICatalogItemPickerProps<IDimensionalityItem, IMetricPickerItemPayload> = {
        itemTypes: pickerItemTypes,
        selectionMode,
        attributeItems: includesAttributes ? attributePickerItems : undefined,
        metricItems: includesMetrics ? metricPickerItems : undefined,
        groups: includesMetrics ? groups : undefined,
        maxListHeight,
        isOpen,
        isLoading: isPickerLoading,
        onBack,
        onClose,
        onAdd: handleAddItems,
        onSelect: handleSelectItem,
        variant: "addFilter",
        renderItemDetails,
    };

    return withHeader ? (
        <CatalogItemPicker {...pickerProps} />
    ) : (
        <CatalogItemPickerContent {...pickerProps} />
    );
}
