// (C) 2025-2026 GoodData Corporation

/**
 * Configuration for area styling in area maps
 *
 * @public
 */
export interface IGeoAreasConfig {
    /**
     * Opacity of filled areas (0-1)
     * @defaultValue 0.7
     */
    fillOpacity?: number;

    /**
     * Color of area borders
     * @defaultValue "#FFFFFF"
     */
    borderColor?: string;

    /**
     * Width of area borders in pixels
     * @defaultValue 1
     */
    borderWidth?: number;
}
