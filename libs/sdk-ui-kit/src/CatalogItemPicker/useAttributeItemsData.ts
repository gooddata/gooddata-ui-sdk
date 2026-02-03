// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { objRefToString } from "@gooddata/sdk-model";

import { type CatalogItemPickerType, type ICatalogItemPickerItem } from "./types.js";

export type CatalogItemsByDataset = Map<string, { title: string; items: ICatalogItemPickerItem[] }>;

const isDateItem = (item: ICatalogItemPickerItem) => item.type === "date";

function filterItemsByType(
    items: ICatalogItemPickerItem[],
    activeType: Extract<CatalogItemPickerType, "attribute" | "date">,
): ICatalogItemPickerItem[] {
    return items.filter((item) => (activeType === "date" ? isDateItem(item) : !isDateItem(item)));
}

function dedupeCatalogAgainstInsight(
    insightItems: ICatalogItemPickerItem[],
    catalogItems: ICatalogItemPickerItem[],
): ICatalogItemPickerItem[] {
    const insightRefKeys = new Set(
        insightItems.map((i) => (i.ref ? objRefToString(i.ref) : undefined)).filter((x): x is string => !!x),
    );
    const insightTitlesWithoutRef = new Set(insightItems.filter((i) => !i.ref).map((i) => i.title));

    return catalogItems.filter((item) => {
        const itemKey = item.ref ? objRefToString(item.ref) : undefined;
        if (itemKey && insightRefKeys.has(itemKey)) {
            return false;
        }
        return !insightTitlesWithoutRef.has(item.title);
    });
}

function filterCatalogBySelectedDateDataset(
    catalogItems: ICatalogItemPickerItem[],
    activeType: Extract<CatalogItemPickerType, "attribute" | "date">,
    selectedDateDatasetKey: string | undefined,
): ICatalogItemPickerItem[] {
    if (activeType !== "date" || !selectedDateDatasetKey) {
        return catalogItems;
    }

    return catalogItems.filter((item) => {
        if (!item.dataset) {
            return true;
        }
        return objRefToString(item.dataset.identifier) === selectedDateDatasetKey;
    });
}

function filterItemsBySearch(
    items: ICatalogItemPickerItem[],
    searchString: string,
): ICatalogItemPickerItem[] {
    if (!searchString.trim()) {
        return items;
    }
    const lowerSearch = searchString.toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(lowerSearch));
}

function groupCatalogItemsByDataset(catalogItems: ICatalogItemPickerItem[]) {
    const grouped = new Map<string, { title: string; items: ICatalogItemPickerItem[] }>();
    const ungroupedItems: ICatalogItemPickerItem[] = [];
    catalogItems.forEach((item) => {
        if (item.dataset) {
            const datasetKey = objRefToString(item.dataset.identifier);
            if (!grouped.has(datasetKey)) {
                grouped.set(datasetKey, { title: item.dataset.title, items: [] });
            }
            grouped.get(datasetKey)!.items.push(item);
            return;
        }
        ungroupedItems.push(item);
    });
    return { grouped, ungroupedItems };
}

interface IUseAttributeItemsDataParams {
    availableInsightItems: ICatalogItemPickerItem[];
    availableCatalogItems: ICatalogItemPickerItem[];
    searchString: string;
    activeType: Extract<CatalogItemPickerType, "attribute" | "date">;
    selectedDateDatasetKey: string | undefined;
}

interface IUseAttributeItemsDataResult {
    filteredInsightItems: ICatalogItemPickerItem[];
    filteredCatalogItems: ICatalogItemPickerItem[];
    catalogItemsByDataset: CatalogItemsByDataset;
    ungroupedCatalogItems: ICatalogItemPickerItem[];
}

/**
 * @internal
 */
export function useAttributeItemsData({
    availableInsightItems,
    availableCatalogItems,
    searchString,
    activeType,
    selectedDateDatasetKey,
}: IUseAttributeItemsDataParams): IUseAttributeItemsDataResult {
    return useMemo(() => {
        const insightItemsAfterType = filterItemsByType(availableInsightItems, activeType);
        const catalogItemsAfterType = filterItemsByType(availableCatalogItems, activeType);

        const dedupedCatalog = dedupeCatalogAgainstInsight(insightItemsAfterType, catalogItemsAfterType);
        const dateDatasetFilteredCatalog = filterCatalogBySelectedDateDataset(
            dedupedCatalog,
            activeType,
            selectedDateDatasetKey,
        );

        const filteredInsightItems = filterItemsBySearch(insightItemsAfterType, searchString);
        const filteredCatalogItems = filterItemsBySearch(dateDatasetFilteredCatalog, searchString);

        // Date items are not grouped by dataset (they use the date dataset selector instead)
        if (activeType === "date") {
            return {
                filteredInsightItems,
                filteredCatalogItems,
                catalogItemsByDataset: new Map<string, { title: string; items: ICatalogItemPickerItem[] }>(),
                ungroupedCatalogItems: [],
            };
        }

        const { grouped, ungroupedItems } = groupCatalogItemsByDataset(filteredCatalogItems);
        return {
            filteredInsightItems,
            catalogItemsByDataset: grouped,
            filteredCatalogItems,
            ungroupedCatalogItems: ungroupedItems,
        };
    }, [availableInsightItems, availableCatalogItems, searchString, activeType, selectedDateDatasetKey]);
}
