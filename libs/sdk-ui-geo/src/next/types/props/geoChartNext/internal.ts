// (C) 2025 GoodData Corporation

/**
 * Internal Props for GeoChartNext
 *
 * @remarks
 * This module contains internal types used by the GeoChartNext implementation.
 * These types are **not part of the public API** and may change without notice.
 *
 * **Why are these internal?**
 * - `ICoreGeoChartNextProps` uses the `IDataVisualizationProps` pattern with
 *   pre-built executions, which is an implementation detail
 * - `IGeoChartNextResolvedProps` represents post-processed props after placeholder
 *   resolution, which consumers don't need to interact with
 * - `ILayerExecutionRecord` is a data structure used internally for layer processing
 *
 * **When might you need these?**
 * - Building custom adapters that integrate with the layer system
 * - Testing internal components
 * - Advanced customization scenarios
 *
 * **Public alternatives:**
 * - Use {@link IGeoChartNextProps} from `./public.js` for component props
 * - Use {@link IGeoLayer} from `../../layers/index.js` for layer definitions
 *
 * @packageDocumentation
 * @internal
 */

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type IDataVisualizationProps } from "@gooddata/sdk-ui";

import { type IGeoChartNextProps } from "./public.js";
import { type GeoLayerType, type IGeoLayer } from "../../layers/index.js";

/**
 * Internal props for GeoChartNext component.
 *
 * @remarks
 * This type extends `IDataVisualizationProps` to provide the `execution` and
 * `executions` props pattern used by GoodData.UI visualization internals.
 * The `execution` prop contains the primary layer execution, while `executions`
 * contains additional layer executions.
 *
 * Use {@link IGeoChartNextProps} for the public-facing props interface.
 *
 * @internal
 */
export type ICoreGeoChartNextProps = Omit<IGeoChartNextProps, "layers"> & IDataVisualizationProps;

/**
 * Resolved props for GeoChartNext after placeholder resolution.
 *
 * @remarks
 * This interface represents the props after `useResolvedGeoChartNextProps` has
 * processed them. Placeholders in layer definitions have been replaced with
 * actual values, and the chart type has been derived from the layers.
 *
 * @internal
 */
export interface IGeoChartNextResolvedProps extends IGeoChartNextProps {
    /**
     * Resolved layers with placeholder values replaced.
     */
    layers: IGeoLayer[];

    /**
     * Resolved chart type derived from the primary layer.
     */
    type: GeoLayerType;
}

/**
 * Normalized layer definition paired with its prepared execution.
 *
 * @remarks
 * This record type is used internally to track the association between
 * layer configurations and their corresponding data executions. It's
 * created during the layer normalization phase and consumed by the
 * data loading and rendering phases.
 *
 * @typeParam TLayer - The specific layer type (defaults to `IGeoLayer`)
 *
 * @internal
 */
export interface ILayerExecutionRecord<TLayer extends IGeoLayer = IGeoLayer> {
    /**
     * Layer ID for reference and lookup.
     */
    layerId: string;

    /**
     * The layer configuration with all attributes and measures.
     */
    layer: TLayer;

    /**
     * Prepared execution ready to fetch data for this layer.
     */
    execution: IPreparedExecution;
}
