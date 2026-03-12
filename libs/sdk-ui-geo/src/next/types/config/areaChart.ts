// (C) 2025-2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoAreasConfig } from "./areas.js";
import { type IGeoChartLegendConfig } from "./legend.js";
import { type IGeoChartViewport } from "./viewport.js";
import type { IGeoLngLat } from "../../../publicTypes/geoCommon.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import type { GeoBasemap, GeoColorScheme } from "../map/basemap.js";

/**
 * Configuration for GeoAreaChart component
 *
 * @public
 */
export interface IGeoAreaChartConfig {
    center?: IGeoLngLat;
    isExportMode?: boolean;
    legend?: IGeoChartLegendConfig;
    limit?: number;
    selectedSegmentItems?: string[];
    zoom?: number; // in the 0-22 zoom range
    /**
     * Custom MapLibre style URL or inline specification.
     */
    mapStyle?: string | StyleSpecification;

    /**
     * Selected basemap.
     *
     * @remarks
     * `undefined` uses the backend default basemap.
     *
     * @alpha
     */
    basemap?: GeoBasemap;

    /**
     * Color scheme for the map style.
     *
     * @remarks
     * `undefined` uses the backend default color scheme for the selected basemap.
     * Ignored for `satellite` and `none` basemaps.
     *
     * @alpha
     */
    colorScheme?: GeoColorScheme;

    /**
     * Maximum zoom level allowed on the map.
     *
     * @remarks
     * - `undefined` keeps default max zoom level
     * - `null` switches to unrestricted zoom level
     */
    maxZoomLevel?: number | null;
    separators?: ISeparators;
    viewport?: IGeoChartViewport;
    areas?: IGeoAreasConfig;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;

    /**
     * Specify the accessibility title for the map canvas.
     *
     * @internal
     */
    a11yTitle?: string;

    /**
     * Enables geo accessibility enhancements introduced for map canvas, legend semantics,
     * live announcements, and alternate table view.
     *
     * @internal
     */
    enableGeoChartA11yImprovements?: boolean;

    /**
     * Enables basemap and color-scheme configuration that relies on backend style support.
     *
     * @internal
     */
    enableGeoBasemapConfig?: boolean;

    /**
     * Enables advanced geo viewport configuration.
     *
     * @internal
     */
    enableGeoChartsViewportConfig?: boolean;

    /**
     * Applies viewport navigation limits (pan/zoom locks) at runtime.
     *
     * @internal
     */
    applyViewportNavigation?: boolean;

    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
    respectLegendPosition?: boolean;
}
