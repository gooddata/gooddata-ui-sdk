// (C) 2025 GoodData Corporation

import { IAttribute, IColorPalette } from "@gooddata/sdk-model";
import { ISeparators } from "@gooddata/sdk-ui";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { IGeoLegendConfigNext } from "./legend.js";
import { IGeoPointsConfigNext } from "./points.js";
import { IGeoConfigViewportNext } from "./viewport.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import { IGeoLngLat } from "../common/coordinates.js";

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
    tooltipText?: IAttribute;
    zoom?: number; // in the 0-22 zoom range
    /**
     * Custom MapLibre style URL or inline specification.
     */
    mapStyle?: string | StyleSpecification;
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
