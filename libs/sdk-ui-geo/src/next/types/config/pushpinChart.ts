// (C) 2025-2026 GoodData Corporation

import { type IAttribute, type IColorPalette } from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { type IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { type IGeoChartLegendConfig } from "./legend.js";
import { type IGeoChartPointsConfig } from "./points.js";
import { type IGeoChartViewport } from "./viewport.js";
import type { IGeoLngLat } from "../../../publicTypes/geoCommon.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import type { GeoTileset } from "../map/tileset.js";

/**
 * Configuration for MapLibre-based pushpin rendering.
 *
 * @remarks
 * This config type is used by the MapLibre-based geo engine when rendering pushpin layers.
 *
 * @public
 */
export interface IGeoPushpinChartConfig {
    center?: IGeoLngLat;
    isExportMode?: boolean;
    legend?: IGeoChartLegendConfig;
    limit?: number;
    selectedSegmentItems?: string[];
    /**
     * Location tooltip label attribute.
     *
     * @remarks
     * Kept for backward compatibility with the legacy GeoPushpinChart API where this lived under `config`.
     * Prefer `tooltipText` on pushpin layers when using {@link GeoChart}.
     */
    tooltipText?: IAttribute;
    zoom?: number; // in the 0-22 zoom range
    /**
     * Mapbox access token.
     *
     * @remarks
     * Kept only for backward compatibility with the legacy Mapbox-based implementation.
     * MapLibre-based geo charts ignore this value.
     *
     * @deprecated Kept only for backward compatibility. Not used by MapLibre-based geo charts.
     */
    mapboxToken?: string;
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
    points?: IGeoChartPointsConfig;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;
    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
    respectLegendPosition?: boolean;
    /**
     * Enables positioning of drill menu at the cursor click point (instead of default positioning).
     *
     * @remarks
     * Feature flag. Default: false.
     */
    enableDrillMenuPositioningAtCursor?: boolean;
}
