// (C) 2025-2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoAreasConfig } from "./areas.js";
import { type IGeoChartLegendConfig } from "./legend.js";
import { type IGeoChartPointsConfig } from "./points.js";
import { type IGeoChartViewport } from "./viewport.js";
import type { IGeoLngLat } from "../../../publicTypes/geoCommon.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import type { GeoTileset } from "../map/tileset.js";

/**
 * Unified configuration shared by {@link GeoChart} and its wrappers.
 *
 * @public
 */
export interface IGeoChartConfig {
    /**
     * Initial map center. Defaults to auto-centering based on data.
     */
    center?: IGeoLngLat;

    /**
     * Initial zoom level (0-22). Defaults to auto-fit.
     */
    zoom?: number;

    /**
     * Enables export mode (disables gestures, preserves drawing buffer).
     */
    isExportMode?: boolean;

    /**
     * Legend configuration.
     */
    legend?: IGeoChartLegendConfig;

    /**
     * Maximum number of rendered data points.
     */
    limit?: number;

    /**
     * Segment values that should stay visible when using legend-driven filtering.
     */
    selectedSegmentItems?: string[];

    /**
     * MapLibre style URL or inline style specification.
     */
    mapStyle?: string | StyleSpecification;

    /**
     * Selected basemap tileset.
     *
     * @alpha
     */
    tileset?: GeoTileset;

    /**
     * Maximum zoom level allowed on the map.
     *
     * @remarks
     * - `undefined` keeps default max zoom level
     * - `null` switches to unrestricted zoom level
     */
    maxZoomLevel?: number | null;

    /**
     * Custom number separators used for formatting.
     */
    separators?: ISeparators;

    /**
     * Viewport preset or explicit bounds.
     */
    viewport?: IGeoChartViewport;

    /**
     * Pushpin-specific options (size range, clustering, ...).
     */
    points?: IGeoChartPointsConfig;

    /**
     * Area-specific options (opacity, border styling, ...).
     */
    areas?: IGeoAreasConfig;

    /**
     * Simple palette expressed as color strings.
     */
    colors?: string[];

    /**
     * Structured color palette compatible with color mapping GUIDs.
     */
    colorPalette?: IColorPalette;

    /**
     * Explicit color-mapping overrides.
     */
    colorMapping?: IColorMapping[];

    /**
     * Displays data labels on the map when supported by the layer.
     */
    showLabels?: boolean;

    /**
     * Requires Ctrl/Cmd + scroll to zoom (helps inside scroll containers).
     */
    cooperativeGestures?: boolean;

    /**
     * Cancels running executions when props change.
     */
    enableExecutionCancelling?: boolean;

    /**
     * Keeps the requested legend position even when responsive heuristics disagree.
     */
    respectLegendPosition?: boolean;

    /**
     * Enables positioning of drill menu at the cursor click point (instead of default positioning).
     *
     * @remarks
     * Feature flag. Default: false.
     */
    enableDrillMenuPositioningAtCursor?: boolean;
}
