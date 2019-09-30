// (C) 2019 GoodData Corporation
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import * as React from "react";
import { IErrorProps } from "../base/simple/ErrorComponent";
import { ILoadingProps } from "../base/simple/LoadingComponent";
import { IChartConfig } from "../highcharts";
import { OnError, OnExportReady, OnFiredDrillEvent2, OnLoadingChanged } from "../base/interfaces/Events";
import { IHeaderPredicate2 } from "../base/interfaces/HeaderPredicate";
import { IDrillableItem } from "../base/interfaces/DrillEvents";
import { IPushData } from "../base/interfaces/PushData";
import { IVisualizationCallbacks, IVisualizationProps } from "../base/interfaces/VisualizationProps";

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
    drillableItems?: Array<IDrillableItem | IHeaderPredicate2>;

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
     * Called when user triggers a drill on a chart.
     */
    onDrill?: OnFiredDrillEvent2;

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
     * TODO: SDK8: make this optional; obtain singleton analytical backend
     */
    backend: IAnalyticalBackend;

    /**
     * Workspace, from which the chart will obtain data to visualize.
     *
     * TODO: SDK8: perhaps should also accept IAnalyticalWorkspace as input
     */
    workspace: string;
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
