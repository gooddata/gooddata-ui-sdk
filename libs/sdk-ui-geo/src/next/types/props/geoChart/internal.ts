// (C) 2025-2026 GoodData Corporation

/**
 * Internal props for GeoChart
 *
 * @remarks
 * This module contains internal types used by the GeoChart implementation.
 * These types are **not part of the public API** and may change without notice.
 *
 * @packageDocumentation
 * @internal
 */

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type INullableFilter } from "@gooddata/sdk-model";
import { type IDataVisualizationProps } from "@gooddata/sdk-ui";

import { type IGeoChartProps } from "./public.js";
import { type GeoLayerType, type IGeoLayer } from "../../layers/index.js";

/**
 * Internal props for GeoChart component.
 *
 * @internal
 */
export type ICoreGeoChartProps = Omit<IGeoChartResolvedProps, "layers"> & IDataVisualizationProps;

/**
 * Resolved props for GeoChart after placeholder resolution.
 *
 * @internal
 */
export interface IGeoChartResolvedProps extends IGeoChartProps {
    layers: IGeoLayer[];
    type: GeoLayerType;
    /**
     * Global filters for the visualization.
     *
     * @remarks
     * In the public `GeoChart` component, these are always resolved to an array (defaults to `[]`).
     * In internal/pluggable visualization usage (`GeoChartInternal`), the data is supplied via prepared
     * executions, so filters may be omitted.
     *
     * @internal
     */
    filters?: INullableFilter[];
}

/**
 * Normalized layer definition paired with its prepared execution.
 *
 * @internal
 */
export interface ILayerExecutionRecord<TLayer extends IGeoLayer = IGeoLayer> {
    layerId: string;
    layer: TLayer;
    execution: IPreparedExecution;
}
