// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { objRefToString } from "@gooddata/sdk-model";

import { type IDimensionalityItem } from "./typings.js";

export const isDateDimensionalityItem = (item: IDimensionalityItem) =>
    item.type === "chronologicalDate" || item.type === "genericDate";

export type CatalogItemsByDataset = Map<string, { title: string; items: IDimensionalityItem[] }>;

interface IUseAttributePickerItemsDataParams {
    availableInsightItems: IDimensionalityItem[];
    availableCatalogItems: IDimensionalityItem[];
    searchString: string;
    effectiveTypeFilter: "attribute" | "date";
    effectiveSelectedDateDatasetKey: string | undefined;
}

interface IUseAttributePickerItemsDataResult {
    filteredInsightItems: IDimensionalityItem[];
    filteredCatalogItems: IDimensionalityItem[];
    catalogItemsByDataset: CatalogItemsByDataset;
}

/**
 * @internal
 * Hook that filters and groups attribute picker items based on type filter, search, and date dataset selection.
 */
export function useAttributePickerItemsData({
    availableInsightItems,
    availableCatalogItems,
    searchString,
    effectiveTypeFilter,
    effectiveSelectedDateDatasetKey,
}: IUseAttributePickerItemsDataParams): IUseAttributePickerItemsDataResult {
    return useMemo(() => {
        // Start from explicit sources so the separation logic cannot drift.
        let insightItemsList = availableInsightItems;
        let catalogItemsList = availableCatalogItems;

        // Apply type filter
        const filterByType = (item: IDimensionalityItem) => {
            return effectiveTypeFilter === "date"
                ? isDateDimensionalityItem(item)
                : !isDateDimensionalityItem(item);
        };
        insightItemsList = insightItemsList.filter(filterByType);
        catalogItemsList = catalogItemsList.filter(filterByType);

        // Remove duplicates: items that are already present in "From visualization" should not appear in catalog.
        // Prefer ref-based dedupe when bucket items provide `ref` (display form ObjRef); fallback to title otherwise.
        const insightRefKeys = new Set(
            insightItemsList
                .map((i) => (i.ref ? objRefToString(i.ref) : undefined))
                .filter((x): x is string => !!x),
        );
        const insightTitlesWithoutRef = new Set(insightItemsList.filter((i) => !i.ref).map((i) => i.title));

        catalogItemsList = catalogItemsList.filter((item) => {
            const itemKey = objRefToString(item.identifier);
            if (insightRefKeys.has(itemKey)) {
                return false;
            }
            return !insightTitlesWithoutRef.has(item.title);
        });

        // If we are in the Date tab, filter date items by selected date dataset
        if (effectiveTypeFilter === "date" && effectiveSelectedDateDatasetKey) {
            const matchesSelectedDataset = (item: IDimensionalityItem) => {
                if (!item.dataset) {
                    // Should not happen once the app provides dataset for all date items; keep as fallback.
                    return true;
                }
                return objRefToString(item.dataset.identifier) === effectiveSelectedDateDatasetKey;
            };
            // Insight ("From visualization") date items should always remain visible.
            catalogItemsList = catalogItemsList.filter(matchesSelectedDataset);
        }

        // Apply search filter
        if (searchString.trim()) {
            const lowerSearch = searchString.toLowerCase();
            const filterBySearch = (item: IDimensionalityItem) =>
                item.title.toLowerCase().includes(lowerSearch);
            insightItemsList = insightItemsList.filter(filterBySearch);
            catalogItemsList = catalogItemsList.filter(filterBySearch);
        }

        // For Date tab, we do not render dataset headers in the list (dataset is selected via "Date as").
        if (effectiveTypeFilter === "date") {
            return {
                filteredInsightItems: insightItemsList,
                filteredCatalogItems: catalogItemsList,
                catalogItemsByDataset: new Map<string, { title: string; items: IDimensionalityItem[] }>(),
            };
        }

        // Group catalog items by dataset (Attribute tab)
        const grouped = new Map<string, { title: string; items: IDimensionalityItem[] }>();
        catalogItemsList.forEach((item) => {
            if (item.dataset) {
                const datasetKey = objRefToString(item.dataset.identifier);
                if (!grouped.has(datasetKey)) {
                    grouped.set(datasetKey, { title: item.dataset.title, items: [] });
                }
                grouped.get(datasetKey)!.items.push(item);
            }
        });

        return {
            filteredInsightItems: insightItemsList,
            catalogItemsByDataset: grouped,
            filteredCatalogItems: catalogItemsList,
        };
    }, [
        availableInsightItems,
        availableCatalogItems,
        searchString,
        effectiveTypeFilter,
        effectiveSelectedDateDatasetKey,
    ]);
}
