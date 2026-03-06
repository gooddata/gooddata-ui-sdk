// (C) 2026 GoodData Corporation

import type { IMapFacade, LngLatLike } from "../../layers/common/mapFacade.js";
import type { IGeoChartConfig } from "../../types/config/unified.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { normalizeBoundsForShortestPath } from "../runtime/bounds.js";
import { DEFAULT_BOUNDS_PADDING } from "../runtime/mapConfig.js";

const WORLD_LONGITUDE_SPAN = 360;
const WORLD_TILE_SIZE = 512;
const FLOATING_POINT_EPSILON = 0.000001;
const MAX_WEB_MERCATOR_LATITUDE = 85.051129;

function getLongitudeSpan(bounds: NonNullable<IMapViewport["bounds"]>): number {
    const west = bounds.southWest.lng;
    const east =
        bounds.northEast.lng >= west ? bounds.northEast.lng : bounds.northEast.lng + WORLD_LONGITUDE_SPAN;
    return east - west;
}

function getSingleWorldMinimumZoom(map: IMapFacade): number | null {
    const canvas = map.getCanvas();
    const canvasWidth = canvas.clientWidth || canvas.width;
    if (canvasWidth <= 0) {
        return null;
    }

    return Math.log2(canvasWidth / WORLD_TILE_SIZE);
}

function clampLatitude(latitude: number): number {
    return Math.max(-MAX_WEB_MERCATOR_LATITUDE, Math.min(MAX_WEB_MERCATOR_LATITUDE, latitude));
}

function latitudeToMercatorY(latitude: number): number {
    const latRad = (clampLatitude(latitude) * Math.PI) / 180;
    return 0.5 - Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / (2 * Math.PI);
}

function getLatitude(center: LngLatLike | undefined): number | null {
    if (!center) {
        return null;
    }

    if (Array.isArray(center)) {
        return center.length >= 2 ? center[1] : null;
    }

    if ("lat" in center && typeof center.lat === "number") {
        return center.lat;
    }

    return null;
}

function toViewportCenter(center: LngLatLike | undefined): IMapViewport["center"] | null {
    if (!center) {
        return null;
    }

    if (Array.isArray(center)) {
        const [lng, lat] = center;
        if (typeof lng === "number" && typeof lat === "number") {
            return { lng, lat };
        }
        return null;
    }

    if (
        "lng" in center &&
        typeof center.lng === "number" &&
        "lat" in center &&
        typeof center.lat === "number"
    ) {
        return { lng: center.lng, lat: center.lat };
    }

    return null;
}

function getDataVisibilityAspectRatioThreshold(
    centerLatitude: number,
    zoom: number,
    dataSouthLatitude: number,
    dataNorthLatitude: number,
    canvasWidth: number,
): number | null {
    if (canvasWidth <= 0) {
        return null;
    }

    const worldSize = WORLD_TILE_SIZE * 2 ** zoom;
    const centerY = latitudeToMercatorY(centerLatitude);
    const dataSouthY = latitudeToMercatorY(dataSouthLatitude);
    const dataNorthY = latitudeToMercatorY(dataNorthLatitude);
    const requiredHalfSpan = Math.max(Math.abs(dataSouthY - centerY), Math.abs(dataNorthY - centerY));

    if (requiredHalfSpan <= FLOATING_POINT_EPSILON) {
        return null;
    }

    const requiredHeight = 2 * requiredHalfSpan * worldSize;
    if (requiredHeight <= 0) {
        return null;
    }

    return canvasWidth / requiredHeight;
}

/**
 * Keep preset viewport as the first priority.
 * Recenter to data while keeping world zoom when the preset world camera cannot keep all loaded data visible.
 */
export function resolveResponsiveViewport(
    map: IMapFacade,
    preferredViewport: Partial<IMapViewport>,
    dataViewport: Partial<IMapViewport> | null,
    config: IGeoChartConfig | undefined,
): Partial<IMapViewport> {
    const isWorldPreset = config?.viewport?.area === "world";
    if (!isWorldPreset || !preferredViewport.bounds || !dataViewport?.bounds) {
        return preferredViewport;
    }

    const isFullWorldBounds =
        getLongitudeSpan(preferredViewport.bounds) + FLOATING_POINT_EPSILON >= WORLD_LONGITUDE_SPAN;
    if (!isFullWorldBounds) {
        return preferredViewport;
    }

    const normalizedWorldBounds = normalizeBoundsForShortestPath(preferredViewport.bounds);
    const worldCamera = map.cameraForBounds(normalizedWorldBounds, { padding: DEFAULT_BOUNDS_PADDING });
    const minimumWorldZoom = getSingleWorldMinimumZoom(map);
    const canvas = map.getCanvas();

    const worldCameraZoom = worldCamera?.zoom;
    const worldCameraCenterLat = getLatitude(worldCamera?.center);
    const isWorldZoomClamped =
        worldCameraZoom !== undefined &&
        minimumWorldZoom !== null &&
        worldCameraZoom + FLOATING_POINT_EPSILON < minimumWorldZoom;
    if (!isWorldZoomClamped) {
        return preferredViewport;
    }

    const effectiveWorldZoom = minimumWorldZoom;
    const canvasWidth = canvas.clientWidth || canvas.width;
    const canvasHeight = canvas.clientHeight || canvas.height;
    const currentAspectRatio = canvasHeight > 0 ? canvasWidth / canvasHeight : null;
    const dataSouth = dataViewport.bounds.southWest.lat;
    const dataNorth = dataViewport.bounds.northEast.lat;
    let dataVisibilityAspectRatioThreshold: number | null = null;
    if (worldCameraCenterLat !== null) {
        dataVisibilityAspectRatioThreshold = getDataVisibilityAspectRatioThreshold(
            worldCameraCenterLat,
            effectiveWorldZoom,
            dataSouth,
            dataNorth,
            canvasWidth,
        );
    }
    const shouldRecenterToData =
        currentAspectRatio !== null &&
        dataVisibilityAspectRatioThreshold !== null &&
        currentAspectRatio - FLOATING_POINT_EPSILON > dataVisibilityAspectRatioThreshold;

    if (!shouldRecenterToData) {
        return preferredViewport;
    }

    const normalizedDataBounds = normalizeBoundsForShortestPath(dataViewport.bounds);
    const dataCamera = map.cameraForBounds(normalizedDataBounds, { padding: DEFAULT_BOUNDS_PADDING });
    const dataCenter = toViewportCenter(dataCamera?.center);

    if (!dataCenter) {
        return preferredViewport;
    }

    return {
        center: dataCenter,
        zoom: effectiveWorldZoom,
    };
}
