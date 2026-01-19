// (C) 2019-2025 GoodData Corporation
import {
    type IAnalyticalBackend,
    type IClusteringConfig,
    type IForecastConfig,
    type IOutliersConfig,
    type IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import { type IExecutionConfig } from "@gooddata/sdk-model";
import { type IVisualizationCallbacks, type IVisualizationProps } from "@gooddata/sdk-ui";

import { type IChartConfig } from "./chartConfig.js";

/**
 * Props applicable for all charts
 *
 * @public
 */
export interface ICommonChartProps extends IVisualizationProps, IChartCallbacks {
    /**
     * Configure chart's behavior and appearance.
     */
    config?: IChartConfig;

    /**
     * Execution configuration, will provide the execution with necessary config before initiating execution.
     */
    execConfig?: IExecutionConfig;

    /**
     * Set height of the chart (in pixels).
     */
    height?: number;

    /**
     * Set width of the chart (in pixels).
     */
    width?: number;
}

/**
 * @public
 */
export interface ILegendItem {
    name: string;
    color: string; // hex or RGB, can be used directly in CSS style
    onClick: () => void; // toggle to show/hide serie in chart
}

/**
 * @public
 */
export interface ILegendData {
    legendItems: ILegendItem[];
}

/**
 * Callback to be called once the legend is rendered.
 *
 * @public
 */
export type OnLegendReady = (data: ILegendData) => void;

/**
 * Defines callbacks to execute for different events.
 *
 * @public
 */
export interface IChartCallbacks extends IVisualizationCallbacks {
    /**
     * Called when legend is rendered.
     */
    onLegendReady?: OnLegendReady;
}

//
// Prop types extended by the bucket components
//

/**
 * Props for all bucket charts.
 *
 * @public
 */
export interface IBucketChartProps extends ICommonChartProps {
    /**
     * Analytical backend, from which the chart will obtain data to visualize
     *
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the chart will obtain data to visualize.
     *
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;
}

//
// Props for all core charts
//

/**
 * Props for all Core* charts.
 *
 * NOTE: Core* charts are NOT part of public API.
 *
 * @internal
 */
export interface ICoreChartProps extends ICommonChartProps {
    /**
     * Prepared execution, which when executed, will provide data to visualize in the chart.
     */
    execution: IPreparedExecution;

    /**
     * Whether to enable execution cancelling.
     * @internal
     */
    enableExecutionCancelling?: boolean;

    /**
     * Forecast configuration to apply to the chart data.
     */
    forecastConfig?: IForecastConfig;

    /**
     * Clustering configuration to apply to the chart data.
     */
    clusteringConfig?: IClusteringConfig;

    /**
     * Outliers configuration to apply to the chart data.
     * @beta
     */
    outliersConfig?: IOutliersConfig;
}
