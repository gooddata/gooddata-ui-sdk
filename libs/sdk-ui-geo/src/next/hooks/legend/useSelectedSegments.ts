// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { useGeoLegend } from "../../context/GeoLegendContext.js";

/**
 * Hook to compute selected segment URIs from enabled legend items.
 *
 * @remarks
 * This hook filters category legend items to only include visible ones,
 * and returns their URIs for use in map filtering. If no legend items are
 * provided or the enabled list is empty (meaning all are enabled), returns
 * an empty array which signals "show all".
 *
 * @param categoryItems - All category legend items
 * @returns Array of URIs for enabled segments (empty array means "show all")
 *
 * @alpha
 */
export function useSelectedSegments(categoryItems: IPushpinCategoryLegendItem[]): string[] {
    const { enabledLegendItems } = useGeoLegend();

    return useMemo(() => {
        if (!categoryItems.length) {
            return [];
        }

        // If no items are explicitly enabled, show all
        if (enabledLegendItems.length === 0) {
            return [];
        }

        // Filter to only enabled items
        return categoryItems.filter((item) => enabledLegendItems.includes(item.uri)).map((item) => item.uri);
    }, [categoryItems, enabledLegendItems]);
}
