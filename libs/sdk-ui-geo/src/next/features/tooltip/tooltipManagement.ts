// (C) 2025 GoodData Corporation

import type { Map as MapLibreMap, MapMouseEvent, Popup } from "maplibre-gl";
import { IntlShape } from "react-intl";

import { IHeaderPredicate } from "@gooddata/sdk-ui";

import { DEFAULT_LAYER_NAME } from "../../constants/geoChart.js";
import {
    handlePushpinMouseEnter,
    handlePushpinMouseLeave,
} from "../../providers/maplibre/maplibreTooltip.js";
import { IMapConfig } from "../../types/mapProvider.js";

/**
 * Set up tooltip event handlers for pushpins
 *
 * @remarks
 * This function sets up mousemove listeners to show/hide tooltips when hovering
 * over pushpins. It queries rendered features at the mouse position and delegates
 * to the existing tooltip handlers.
 *
 * @param map - MapLibre map instance
 * @param tooltip - Popup instance for displaying tooltips
 * @param config - Map configuration
 * @param drillableItems - Array of drillable item predicates
 * @param intl - Internationalization configuration
 * @returns Cleanup function to remove event listeners
 *
 * @internal
 */
export function setupTooltipHandlers(
    map: MapLibreMap,
    tooltip: Popup,
    config: IMapConfig,
    drillableItems?: IHeaderPredicate[],
    intl?: IntlShape,
): () => void {
    const layerId = DEFAULT_LAYER_NAME;

    const handleMouseMove = (e: MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: [layerId],
        });

        if (features && features.length > 0) {
            handlePushpinMouseEnter(e, map, tooltip, config, drillableItems, intl);
        } else {
            // Mouse not over any pushpin, hide tooltip if showing
            if (tooltip.isOpen()) {
                handlePushpinMouseLeave(e, map, tooltip, config);
            }
        }
    };

    map.on("mousemove", handleMouseMove);

    return () => {
        map.off("mousemove", handleMouseMove);
    };
}

/**
 * Show tooltip at specified location
 *
 * @param map - MapLibre map instance
 * @param tooltip - Popup instance
 * @param lngLat - Location to show tooltip
 * @param html - HTML content for tooltip
 * @param className - Optional CSS class name
 * @param offset - Optional pixel offset
 *
 * @internal
 */
export function showTooltip(
    map: MapLibreMap,
    tooltip: Popup,
    lngLat: { lng: number; lat: number },
    html: string,
    className?: string,
    offset?: [number, number],
): void {
    tooltip.setLngLat([lngLat.lng, lngLat.lat]).setHTML(html).addTo(map);

    if (className) {
        tooltip.addClassName(className);
    }

    if (offset) {
        tooltip.setOffset(offset);
    }
}

/**
 * Hide the currently displayed tooltip
 *
 * @param tooltip - Popup instance
 *
 * @internal
 */
export function hideTooltip(tooltip: Popup): void {
    tooltip.remove();
}
