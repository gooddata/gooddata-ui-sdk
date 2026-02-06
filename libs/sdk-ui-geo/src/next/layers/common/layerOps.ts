// (C) 2025-2026 GoodData Corporation

import { type FilterSpecification, type GeoJSONSourceSpecification, type IMapFacade } from "./mapFacade.js";

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

/**
 * Checks whether a GeoJSON source can be updated in-place using `setData`.
 *
 * @remarks
 * Update hooks should use this to avoid doing expensive recomputation when the map/style/source
 * isn't ready yet. The actual update is performed by {@link trySetGeoJsonSourceData}.
 *
 * @internal
 */
export function canSetGeoJsonSourceData(map: IMapFacade, sourceId: string): boolean {
    if (!hasValidStyle(map)) {
        return false;
    }

    const source = map.getSource(sourceId);
    if (!source || typeof source !== "object") {
        return false;
    }

    return "setData" in source && typeof source.setData === "function";
}

/**
 * Attempts to update a GeoJSON source in-place (without remove+add).
 *
 * @remarks
 * This is used to avoid flicker when only feature properties change (e.g. recoloring).
 * Returns `true` when the source existed and was updated.
 *
 * @internal
 */
export function trySetGeoJsonSourceData(
    map: IMapFacade,
    sourceId: string,
    data: GeoJSONSourceSpecification["data"] | undefined,
): boolean {
    if (!hasValidStyle(map)) {
        return false;
    }

    if (!data || typeof data === "string") {
        return false;
    }

    const source = map.getSource(sourceId);
    if (!source || typeof source !== "object") {
        return false;
    }

    if (!("setData" in source)) {
        // Preserve previous adapter behavior: if the source exists but cannot be updated in place,
        // do not fall back to remove+add (which can look like a full map re-init).
        return true;
    }

    if (typeof source.setData !== "function") {
        // Preserve previous adapter behavior: treat as "handled" to avoid remove+add fallback.
        return true;
    }

    try {
        // IMPORTANT: call as a method to preserve MapLibre GeoJSONSource `this` binding.
        source.setData(data);
    } catch {
        return false;
    }
    return true;
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
