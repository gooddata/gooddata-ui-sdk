// (C) 2026 GoodData Corporation

/**
 * Represents geographic coordinates in latitude/longitude format.
 *
 * @public
 */
export interface IGeoLngLat {
    lat: number;
    lng: number;
}

/**
 * Represents geographic bounds defined by north-east and south-west coordinates.
 *
 * @public
 */
export interface IGeoLngLatBounds {
    northEast: IGeoLngLat;
    southWest: IGeoLngLat;
}

/**
 * Callback fired when the map center changes.
 *
 * @public
 */
export type CenterPositionChangedCallback = (center: IGeoLngLat) => void;

/**
 * Callback fired when map zoom changes.
 *
 * @public
 */
export type ZoomChangedCallback = (zoom: number) => void;
