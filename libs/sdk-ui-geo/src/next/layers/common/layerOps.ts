// (C) 2025 GoodData Corporation

import type { FilterSpecification, IMapFacade } from "./mapFacade.js";

function hasValidStyle(map: IMapFacade): boolean {
    return Boolean(map?.getStyle?.());
}

/**
 * Sets visibility of a MapLibre layer.
 *
 * @remarks
 * Uses MapLibre's setLayoutProperty to toggle visibility without removing/adding layers.
 * This is much smoother than remove/add cycles.
 *
 * @param map - Map facade
 * @param layerId - MapLibre layer ID
 * @param visible - Whether the layer should be visible
 *
 * @internal
 */
export function setLayerVisibility(map: IMapFacade, layerId: string, visible: boolean): void {
    if (!hasValidStyle(map)) {
        return;
    }

    if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    }
}

/**
 * Sets a filter on a MapLibre layer.
 *
 * @remarks
 * Uses MapLibre's setFilter to update which features are shown without removing/adding layers.
 * Pass `undefined` to clear the filter and show all features.
 *
 * @param map - Map facade
 * @param layerId - MapLibre layer ID
 * @param filter - Filter specification or undefined to clear
 *
 * @internal
 */
export function setLayerFilter(
    map: IMapFacade,
    layerId: string,
    filter: FilterSpecification | undefined,
): void {
    if (!hasValidStyle(map)) {
        return;
    }

    if (map.getLayer(layerId)) {
        map.setFilter(layerId, filter ?? null);
    }
}

export function removeLayerIfExists(map: IMapFacade, layerId: string): void {
    if (!hasValidStyle(map)) {
        return;
    }

    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
}

export function removeSourceIfExists(map: IMapFacade, sourceId: string): void {
    if (!hasValidStyle(map)) {
        return;
    }

    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }
}
