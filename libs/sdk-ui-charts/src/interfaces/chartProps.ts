// (C) 2019-2020 GoodData Corporation
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import * as React from "react";
import {
    IHeaderPredicate,
    IErrorProps,
    ILoadingProps,
    IDrillableItem,
    OnFiredDrillEvent,
    IPushData,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    IVisualizationCallbacks,
    IVisualizationProps,
} from "@gooddata/sdk-ui";
import { IChartConfig } from "./chartConfig";

/**
 * Props applicable for all charts
 *
 * @public
 */
export interface ICommonChartProps extends IVisualizationProps, IChartCallbacks {
    /**
     * Set Locale for chart localization.
     *
     * Note: This locale will be used for everything EXCEPT the data being visualized.
     */
    locale?: string;

    /**
     * Configure chart drillability; e.g. which parts of the
     */
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;

    /**
     * Configure chart's behavior and appearance.
     */
    config?: IChartConfig;

    /**
     * Set height of the chart (in pixels).
     */
    height?: number;

    /**
     * React component to display in the event when there is an error with either obtaining the data from
     * backend or with the data itself.
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * React component to display while loading data from the backend.
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}

export interface ILegendItem {
    name: string;
    color: string; // hex or RGB, can be used directly in CSS style
    onClick: () => void; // toggle to show/hide serie in chart
}

export interface ILegendData {
    legendItems: ILegendItem[];
}

export type OnLegendReady = (data: ILegendData) => void;

/**
 * Defines callbacks to execute for different events.
 *
 * @public
 */
export interface IChartCallbacks extends IVisualizationCallbacks {
    /**
     * Called when an error occurs while loading data for the chart.
     */
    onError?: OnError;

    /**
     * Called when the chart is ready to be exported.
     */
    onExportReady?: OnExportReady;

    /**
     * Called when loading status of the chart changes - chart starts loading or stops loading
     */
    onLoadingChanged?: OnLoadingChanged;

    /**
     * Called when legend is rendered.
     */
    onLegendReady?: OnLegendReady;

    /**
     * Called when user triggers a drill on a chart.
     */
    onDrill?: OnFiredDrillEvent;

    /**
     * @internal
     */
    afterRender?: () => void;

    /**
     * @internal
     */
    pushData?: (data: IPushData) => void;
}

//
// Prop types extended by the bucket components
//

/**
 * Props for all bucket charts.
 *
 * TODO: SDK8: revisit the naming
 * @public
 */
export interface IBucketChartProps extends ICommonChartProps {
    /**
     * Analytical backend, from which the chart will obtain data to visualize
     *
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace, from which the chart will obtain data to visualize.
     *
     * TODO: SDK8: perhaps should also accept IAnalyticalWorkspace as input
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
}
