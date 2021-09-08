// (C) 2020-2021 GoodData Corporation
import React, { ComponentType } from "react";
import { FilterContextItem, IAnalyticalBackend, IKpiWidget, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { IErrorProps, ILoadingProps, OnError } from "@gooddata/sdk-ui";
import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../../../types";

///
/// Custom component types
///

/**
 * @internal
 */
export type CustomDashboardKpiComponent = ComponentType;

///
/// Component props
///

/**
 * @internal
 */
export interface DashboardKpiProps {
    /**
     * The KPI to execute and display.
     */
    kpiWidget: IKpiWidget;

    /**
     * Optionally, specify alert set by the current user to this KPI.
     */
    alert?: IWidgetAlert;

    /**
     * Optionally, specify filters to be applied to the KPI.
     */
    filters?: FilterContextItem[];

    /**
     * Optionally, specify a callback that will be triggered when the filters should be changed.
     * (e.g. to apply filters of a KPI alert to the whole dashboard)
     */
    onFiltersChange?: (filters: IDashboardFilter[], resetOthers?: boolean) => void;

    /**
     * Called when user triggers a drill on a visualization.
     */
    onDrill?: OnFiredDashboardViewDrillEvent;

    /**
     * Called in case of any error, either in the dashboard loading or any of the widgets execution.
     */
    onError?: OnError;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the KPI exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Component to render if embedding fails.
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the KPI is loading.
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;
}
