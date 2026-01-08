// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { objRefToString } from "@gooddata/sdk-model";

import { type IDimensionalityItem } from "./typings.js";

export const isDateDimensionalityItem = (item: IDimensionalityItem) =>
    item.type === "chronologicalDate" || item.type === "genericDate";

export type CatalogItemsByDataset = Map<string, { title: string; items: IDimensionalityItem[] }>;

function filterItemsByType(
    items: IDimensionalityItem[],
    effectiveTypeFilter: "attribute" | "date",
): IDimensionalityItem[] {
    const filterByType = (item: IDimensionalityItem) =>
        effectiveTypeFilter === "date" ? isDateDimensionalityItem(item) : !isDateDimensionalityItem(item);
    return items.filter(filterByType);
}

function dedupeCatalogAgainstInsight(
    insightItems: IDimensionalityItem[],
    catalogItems: IDimensionalityItem[],
): IDimensionalityItem[] {
    // Remove duplicates: items that are already present in "From visualization" should not appear in catalog.
    // Prefer ref-based dedupe when bucket items provide `ref` (display form ObjRef); fallback to title otherwise.
    const insightRefKeys = new Set(
        insightItems.map((i) => (i.ref ? objRefToString(i.ref) : undefined)).filter((x): x is string => !!x),
    );
    const insightTitlesWithoutRef = new Set(insightItems.filter((i) => !i.ref).map((i) => i.title));

    return catalogItems.filter((item) => {
        const itemKey = objRefToString(item.identifier);
        if (insightRefKeys.has(itemKey)) {
            return false;
        }
        return !insightTitlesWithoutRef.has(item.title);
    });
}

function filterCatalogBySelectedDateDataset(
    catalogItems: IDimensionalityItem[],
    effectiveTypeFilter: "attribute" | "date",
    effectiveSelectedDateDatasetKey: string | undefined,
): IDimensionalityItem[] {
    // If we are in the Date tab, filter date items by selected date dataset
    if (effectiveTypeFilter !== "date" || !effectiveSelectedDateDatasetKey) {
        return catalogItems;
    }

    const matchesSelectedDataset = (item: IDimensionalityItem) => {
        if (!item.dataset) {
            // Should not happen once the app provides dataset for all date items; keep as fallback.
            return true;
        }
        return objRefToString(item.dataset.identifier) === effectiveSelectedDateDatasetKey;
    };

    // Insight ("From visualization") date items should always remain visible. (This only filters catalog items.)
    return catalogItems.filter(matchesSelectedDataset);
}

function filterItemsBySearch(items: IDimensionalityItem[], searchString: string): IDimensionalityItem[] {
    // Apply search filter
    if (!searchString.trim()) {
        return items;
    }
    const lowerSearch = searchString.toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(lowerSearch));
}

function groupCatalogItemsByDataset(catalogItems: IDimensionalityItem[]): CatalogItemsByDataset {
    // Group catalog items by dataset (Attribute tab)
    const grouped = new Map<string, { title: string; items: IDimensionalityItem[] }>();
    catalogItems.forEach((item) => {
        if (item.dataset) {
            const datasetKey = objRefToString(item.dataset.identifier);
            if (!grouped.has(datasetKey)) {
                grouped.set(datasetKey, { title: item.dataset.title, items: [] });
            }
            grouped.get(datasetKey)!.items.push(item);
        }
    });
    return grouped;
}

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
        const insightItemsAfterType = filterItemsByType(availableInsightItems, effectiveTypeFilter);
        const catalogItemsAfterType = filterItemsByType(availableCatalogItems, effectiveTypeFilter);

        const dedupedCatalog = dedupeCatalogAgainstInsight(insightItemsAfterType, catalogItemsAfterType);
        const dateDatasetFilteredCatalog = filterCatalogBySelectedDateDataset(
            dedupedCatalog,
            effectiveTypeFilter,
            effectiveSelectedDateDatasetKey,
        );

        const filteredInsightItems = filterItemsBySearch(insightItemsAfterType, searchString);
        const filteredCatalogItems = filterItemsBySearch(dateDatasetFilteredCatalog, searchString);

        // For Date tab, we do not render dataset headers in the list (dataset is selected via "Date as").
        if (effectiveTypeFilter === "date") {
            return {
                filteredInsightItems,
                filteredCatalogItems,
                catalogItemsByDataset: new Map<string, { title: string; items: IDimensionalityItem[] }>(),
            };
        }

        return {
            filteredInsightItems,
            catalogItemsByDataset: groupCatalogItemsByDataset(filteredCatalogItems),
            filteredCatalogItems,
        };
    }, [
        availableInsightItems,
        availableCatalogItems,
        searchString,
        effectiveTypeFilter,
        effectiveSelectedDateDatasetKey,
    ]);
}
