// (C) 2025-2026 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoAreasConfig } from "./areas.js";
import { type IGeoChartLegendConfig } from "./legend.js";
import { type IGeoChartViewport } from "./viewport.js";
import type { IGeoLngLat } from "../../../publicTypes/geoCommon.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import type { GeoTileset } from "../map/tileset.js";

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
    separators?: ISeparators;
    viewport?: IGeoChartViewport;
    areas?: IGeoAreasConfig;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;
    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
    respectLegendPosition?: boolean;
}
