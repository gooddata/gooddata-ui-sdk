// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useGeoLegend } from "../../context/GeoLegendContext.js";
import { type IGeoLegendItem } from "../../types/common/legends.js";

/**
 * Hook to handle legend item click interactions.
 *
 * @remarks
 * This hook provides a callback for toggling legend items on/off.
 * When a legend item is clicked, it updates the enabled state in the legend context,
 * which will filter visible pushpins on the map.
 *
 * @param allUris - All available legend item URIs (for toggle logic)
 * @returns Callback function for legend item clicks
 *
 * @alpha
 */
export function useLegendItemClick(allUris: string[]): (item: IGeoLegendItem) => void {
    const { toggleLegendItem } = useGeoLegend();

    return useCallback(
        (item: IGeoLegendItem) => {
            toggleLegendItem(item.uri, allUris);
        },
        [toggleLegendItem, allUris],
    );
}
