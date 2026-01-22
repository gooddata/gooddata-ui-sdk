// (C) 2025-2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoLegendConfigNext } from "./legend.js";
import { type IGeoPointsConfigNext } from "./points.js";
import { type IGeoConfigViewportNext } from "./viewport.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import { type IGeoLngLat } from "../common/coordinates.js";
import type { GeoTileset } from "../map/tileset.js";

/**
 * Configuration for GeoPushpinChartNext component
 *
 * @alpha
 */
export interface IGeoPushpinChartNextConfig {
    center?: IGeoLngLat;
    isExportMode?: boolean;
    legend?: IGeoLegendConfigNext;
    limit?: number;
    selectedSegmentItems?: string[];
    zoom?: number; // in the 0-22 zoom range
    /**
     * Custom MapLibre style URL or inline specification.
     */
    mapStyle?: string | StyleSpecification;

    /**
     * Selected basemap tileset.
     */
    tileset?: GeoTileset;
    /**
     * Maximum zoom level allowed on the map. Null/undefined keeps MapLibre defaults.
     */
    maxZoomLevel?: number | null;
    separators?: ISeparators;
    viewport?: IGeoConfigViewportNext;
    points?: IGeoPointsConfigNext;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;
    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
    respectLegendPosition?: boolean;
}
