// (C) 2025 GoodData Corporation

/**
 * Represents geographic coordinates in latitude/longitude format
 *
 * @alpha
 */
export interface IGeoLngLat {
    /**
     * Latitude coordinate (-90 to 90)
     */
    lat: number;
    /**
     * Longitude coordinate (-180 to 180)
     */
    lng: number;
}

/**
 * Represents geographic bounds defined by north-east and south-west coordinates
 *
 * @alpha
 */
export interface IGeoLngLatBounds {
    /**
     * North-east corner of the bounds
     */
    northEast: IGeoLngLat;
    /**
     * South-west corner of the bounds
     */
    southWest: IGeoLngLat;
}
