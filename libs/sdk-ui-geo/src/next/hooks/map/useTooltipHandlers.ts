// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import type { Map as MapLibreMap, Popup } from "maplibre-gl";
import { IntlShape } from "react-intl";

import { IHeaderPredicate } from "@gooddata/sdk-ui";

import { setupTooltipHandlers } from "../../features/tooltip/tooltipManagement.js";
import { IMapConfig } from "../../types/mapProvider.js";

/**
 * Set up tooltip handlers for map interactions
 *
 * @remarks
 * This hook manages tooltip event listeners for the map. It sets up
 * mousemove handlers to show/hide tooltips when hovering over pushpins,
 * and properly cleans them up when dependencies change or on unmount.
 *
 * @param map - MapLibre map instance (null if not initialized)
 * @param tooltip - Popup instance for displaying tooltips (null if not initialized)
 * @param config - Map configuration
 * @param drillablePredicates - Array of drillable item predicates
 * @param intl - Internationalization configuration
 *
 * @internal
 */
export function useTooltipHandlers(
    map: MapLibreMap | null,
    tooltip: Popup | null,
    config: IMapConfig | undefined,
    drillablePredicates: IHeaderPredicate[],
    intl: IntlShape,
    layerId?: string,
): void {
    useEffect(() => {
        if (!map || !tooltip || !config) {
            return undefined;
        }

        return setupTooltipHandlers(map, tooltip, config, drillablePredicates, intl, layerId);
    }, [map, tooltip, config, drillablePredicates, intl, layerId]);
}
