// (C) 2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import {
    type CatalogItemPickerType,
    type ICatalogItemPickerItem,
    type ICatalogItemPickerItems,
} from "./types.js";

/**
 * Hook to manage tab visibility and effective type selection.
 */
export function usePickerTabs(
    itemTypes: CatalogItemPickerType[],
    activeType: CatalogItemPickerType,
): { showTabs: boolean; effectiveType: CatalogItemPickerType } {
    const showTabs = itemTypes.length > 1;
    const effectiveType = showTabs ? activeType : itemTypes[0];
    return { showTabs, effectiveType };
}

/**
 * Hook to ensure active type is valid when tabs are hidden.
 */
export function useEnsureActiveType(
    itemTypes: CatalogItemPickerType[],
    showTabs: boolean,
    setActiveType: (type: CatalogItemPickerType) => void,
): void {
    useEffect(() => {
        if (!showTabs) {
            setActiveType(itemTypes[0]);
        }
    }, [itemTypes, setActiveType, showTabs]);
}

export function useFilteredMetricItems(
    metricItems: ICatalogItemPickerItems | undefined,
    searchString: string,
    effectiveType: CatalogItemPickerType,
    source: "insightItems" | "catalogItems",
): ICatalogItemPickerItem[] {
    return useMemo(() => {
        const items: ICatalogItemPickerItem[] = metricItems?.[source] ?? [];
        if (!searchString.trim() || effectiveType !== "metric") {
            return items;
        }
        const lowered = searchString.toLowerCase();
        return items.filter((item) => item.title.toLowerCase().includes(lowered));
    }, [effectiveType, metricItems, searchString, source]);
}
