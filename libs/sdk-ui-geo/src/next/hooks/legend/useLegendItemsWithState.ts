// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { IPushpinCategoryLegendItem } from "@gooddata/sdk-ui-vis-commons";

import { useGeoLegend } from "../../context/GeoLegendContext.js";

/**
 * Hook to merge legend items with their visibility state from context.
 *
 * @remarks
 * This hook takes the base legend items (with colors, names, etc.) and merges
 * them with the current visibility state from the GeoLegendContext. It returns
 * updated legend items with the correct `isVisible` property.
 *
 * In the old implementation, all items start visible. When you click an item,
 * it toggles its visibility. The same behavior is replicated here:
 * - Empty enabledLegendItems array = all items visible (initial state)
 * - Items in enabledLegendItems array = those items are visible
 *
 * @param baseLegendItems - Base legend items from data transformation
 * @returns Legend items with updated isVisible state
 *
 * @alpha
 */
export function useLegendItemsWithState(
    baseLegendItems: IPushpinCategoryLegendItem[],
): IPushpinCategoryLegendItem[] {
    const { enabledLegendItems } = useGeoLegend();

    return useMemo(() => {
        if (!baseLegendItems.length) {
            return [];
        }

        // If no items are explicitly tracked, all are visible (initial state)
        if (enabledLegendItems.length === 0) {
            return baseLegendItems.map((item) => ({
                ...item,
                isVisible: true,
            }));
        }

        // Otherwise, item is visible if it's in the enabled list
        return baseLegendItems.map((item) => ({
            ...item,
            isVisible: enabledLegendItems.includes(item.uri),
        }));
    }, [baseLegendItems, enabledLegendItems]);
}
