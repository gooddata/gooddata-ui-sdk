// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useGeoLegend } from "../../context/GeoLegendContext.js";
import { IGeoLegendItem } from "../../types/common/legends.js";

/**
 * Hook to compute selected segment URIs from enabled legend items.
 *
 * @remarks
 * This hook filters category legend items to only include visible ones,
 * and returns their URIs for use in map filtering. If no legend items are provided,
 * or the state indicates either "all enabled" or "all disabled", returns an empty array
 * which signals "show all".
 *
 * @param categoryItems - All category legend items
 * @returns Array of URIs for enabled segments (empty array means "show all")
 *
 * @alpha
 */
export function useSelectedSegments(categoryItems: IGeoLegendItem[]): string[] {
    const { enabledLegendItems } = useGeoLegend();

    return useMemo(() => {
        if (!categoryItems.length) {
            return [];
        }

        if (enabledLegendItems === null) {
            return [];
        }

        if (enabledLegendItems.length === 0) {
            return [];
        }

        return categoryItems.filter((item) => enabledLegendItems.includes(item.uri)).map((item) => item.uri);
    }, [categoryItems, enabledLegendItems]);
}
