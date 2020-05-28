// (C) 2019-2020 GoodData Corporation

import { IDrillableItem, OnFiredDrillEvent } from "./DrillEvents";
import { IHeaderPredicate } from "../headerMatching/HeaderPredicate";
import * as React from "react";
import { IErrorProps } from "../react/ErrorComponent";
import { ILoadingProps } from "../react/LoadingComponent";
import { IPushData, OnError, OnExportReady, OnLoadingChanged } from "./Events";

/**
 * Super-interface for all visualization props; charts, tables or anything else - all should have these
 * basic props.
 */
export interface IVisualizationProps {
    /**
     * Set Locale for visualization localization.
     *
     * Note: This locale will be used for everything EXCEPT the data being visualized.
     */
    locale?: string;

    /**
     * Set title to use for exported files.
     *
     * Note: you can also specify export file name as parameters to the export function which you
     * receive in the onExportReady. If you do not specify title here and neither as input to export function,
     * the the name will default to name of the visualization component.
     */
    exportTitle?: string;

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     */
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;

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
 * Super-interface for all visualization callbacks; all visualizations SHOULD have at least these callbacks
 * defined.
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
