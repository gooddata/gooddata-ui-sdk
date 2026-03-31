// (C) 2025-2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoAreasConfig } from "./areas.js";
import { type IGeoChartLegendConfig } from "./legend.js";
import { type IGeoChartViewport } from "./viewport.js";
import type { IGeoLngLat, IGeoLngLatBounds } from "../../../publicTypes/geoCommon.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import type { GeoBasemap } from "../map/basemap.js";

/**
 * Configuration for GeoAreaChart component
 *
 * @public
 */
export interface IGeoAreaChartConfig {
    center?: IGeoLngLat;
    /**
     * Bounding box for custom viewport. Takes priority over center/zoom
     * and adapts to container dimensions.
     */
    bounds?: IGeoLngLatBounds;
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
     * Selected basemap style identifier (e.g. `"standard-light"`, `"satellite"`).
     *
     * @remarks
     * `undefined` uses the backend default basemap.
     *
     * @alpha
     */
    basemap?: GeoBasemap;

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
     * Enables basemap configuration that relies on backend style support.
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
