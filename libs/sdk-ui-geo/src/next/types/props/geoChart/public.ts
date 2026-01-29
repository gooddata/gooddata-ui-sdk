// (C) 2025-2026 GoodData Corporation

import { type IGeoChartConfig } from "../../config/unified.js";
import { type GeoLayerType, type IGeoLayer } from "../../layers/index.js";
import { type IGeoCommonExecutionProps } from "../shared.js";

/**
 * Props for {@link GeoChart}.
 *
 * @public
 */
export interface IGeoChartProps extends IGeoCommonExecutionProps {
    /**
     * Visualization type reported through pushData callbacks. Defaults to the primary layer type.
     */
    type?: GeoLayerType;

    /**
     * Array of layer definitions rendered in order. The first layer drives legends and drilling.
     */
    layers: IGeoLayer[];

    /**
     * Unified configuration shared by all layers.
     */
    config?: IGeoChartConfig;

    // host wiring props inherited from IGeoCommonExecutionProps
}
