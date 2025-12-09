// (C) 2025 GoodData Corporation

import { IAttribute, IColorPalette } from "@gooddata/sdk-model";
import { ISeparators } from "@gooddata/sdk-ui";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { IGeoAreasConfig } from "./areas.js";
import { IGeoLegendConfigNext } from "./legend.js";
import { IGeoPointsConfigNext } from "./points.js";
import { IGeoConfigViewportNext } from "./viewport.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import { IGeoLngLat } from "../common/coordinates.js";

/**
 * Unified configuration shared by {@link GeoChartNext} and its wrappers.
 *
 * @alpha
 */
export interface IGeoChartNextConfig {
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
    legend?: IGeoLegendConfigNext;

    /**
     * Maximum number of rendered data points.
     */
    limit?: number;

    /**
     * Segment values that should stay visible when using legend-driven filtering.
     */
    selectedSegmentItems?: string[];

    /**
     * Attribute used for tooltip labeling.
     */
    tooltipText?: IAttribute;

    /**
     * MapLibre style URL or inline style specification.
     */
    mapStyle?: string | StyleSpecification;

    /**
     * Custom number separators used for formatting.
     */
    separators?: ISeparators;

    /**
     * Viewport preset or explicit bounds.
     */
    viewport?: IGeoConfigViewportNext;

    /**
     * Pushpin-specific options (size range, clustering, ...).
     */
    points?: IGeoPointsConfigNext;

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
}
