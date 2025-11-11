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
 * - `enabledLegendItems === null`: all items visible (initial state)
 * - `enabledLegendItems.length === 0`: user disabled every item (legend greyed out)
 * - items listed in `enabledLegendItems`: only those stay visible
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

        // No explicit state recorded means everything stays visible (initial state).
        if (enabledLegendItems === null) {
            return baseLegendItems.map((item) => ({
                ...item,
                isVisible: true,
            }));
        }

        // Explicitly tracking an empty list means all items are disabled (legacy behavior).
        if (enabledLegendItems.length === 0) {
            return baseLegendItems.map((item) => ({
                ...item,
                isVisible: false,
            }));
        }

        // Otherwise, item is visible if it's in the enabled list
        return baseLegendItems.map((item) => ({
            ...item,
            isVisible: enabledLegendItems.includes(item.uri),
        }));
    }, [baseLegendItems, enabledLegendItems]);
}
