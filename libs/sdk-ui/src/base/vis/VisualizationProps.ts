// (C) 2019-2022 GoodData Corporation

import { ExplicitDrill, OnFiredDrillEvent } from "./DrillEvents.js";
import React from "react";
import { IErrorProps } from "../react/ErrorComponent.js";
import { ILoadingProps } from "../react/LoadingComponent.js";
import { IPushData, OnError, OnExportReady, OnLoadingChanged } from "./Events.js";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";

/**
 * Super-interface for all visualization props.
 *
 * @remarks
 * Charts, tables or anything else - all should have these basic props.
 *
 * @public
 */
export interface IVisualizationProps {
    /**
     * Set Locale for visualization localization.
     *
     * @remarks
     * Note: This locale will be used for everything EXCEPT the data being visualized.
     */
    locale?: string;

    /**
     * Set title to use for exported files.
     *
     * @remarks
     * Note: you can also specify export file name as parameters to the export function which you
     * receive in the onExportReady. If you do not specify title here and neither as input to export function,
     * the the name will default to name of the visualization component.
     */
    exportTitle?: string;

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     */
    drillableItems?: ExplicitDrill[];

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
 * Super-interface for all visualization callbacks.
 *
 * @remarks
 * All visualizations SHOULD have at least these callbacks defined.
 *
 * @public
 */
export interface IVisualizationCallbacks {
    /**
     * Called when an error occurs while loading data for the visualization.
     */
    onError?: OnError;

    /**
     * Called when the visualization is ready to be exported.
     */
    onExportReady?: OnExportReady;

    /**
     * Called when loading status of the visualization changes - vis starts or stops loading
     */
    onLoadingChanged?: OnLoadingChanged;

    /**
     * Called when user triggers a drill on a visualization.
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

/**
 * Common props for visualization of data computed by the analytical backend.
 *
 * @remarks
 * Data visualization contains prepared execution which will return data that needs to be visualized.
 *
 * @public
 */
export interface IDataVisualizationProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Prepared execution - running this will compute data to visualize.
     */
    execution: IPreparedExecution;
}
