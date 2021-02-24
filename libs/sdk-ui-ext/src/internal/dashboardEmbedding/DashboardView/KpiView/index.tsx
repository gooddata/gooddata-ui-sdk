// (C) 2020 GoodData Corporation
import React from "react";
import {
    FilterContextItem,
    IAnalyticalBackend,
    IFilterContext,
    ITempFilterContext,
    IKpiWidget,
    IWidgetAlert,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    IErrorProps,
    ILoadingProps,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    IDrillableItem,
    IHeaderPredicate,
    OnError,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

import { KpiExecutor } from "./KpiExecutor";
import { useDashboardViewConfig, useDashboardViewIsReadOnly } from "../contexts";
import { useKpiData } from "../../hooks/internal";
import { IDashboardFilter } from "../../types";
import { OnFiredDashboardViewDrillEvent } from "../types";

interface IKpiViewProps {
    /**
     * Ref to the dashboard this KPI is part of.
     */
    dashboardRef: ObjRef;

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
    onFiltersChange?: (filters: IDashboardFilter[]) => void;

    /**
     * The filter context used in the parent dashboard.
     */
    filterContext?: IFilterContext | ITempFilterContext;

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     */
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;

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

/**
 * Takes a KPI widget and executes it and displays the result.
 * @internal
 */
export const KpiView: React.FC<IKpiViewProps> = ({
    dashboardRef,
    kpiWidget,
    alert,
    filters,
    onFiltersChange,
    filterContext,
    drillableItems,
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    invariant(kpiWidget.kpi, "The provided widget is not a KPI widget.");

    const { error, result, status } = useKpiData({
        kpiWidget,
        backend,
        filters,
        filterContext,
        workspace,
        onError,
    });

    const config = useDashboardViewConfig();
    const isReadOnly = useDashboardViewIsReadOnly();

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent message={error.message} />;
    }

    return (
        <KpiExecutor
            dashboardRef={dashboardRef}
            kpiWidget={kpiWidget}
            primaryMeasure={result.primaryMeasure}
            secondaryMeasure={result.secondaryMeasure}
            alert={alert}
            allFilters={result.allFilters}
            effectiveFilters={result.effectiveFilters}
            onFiltersChange={onFiltersChange}
            onDrill={onDrill}
            onError={onError}
            drillableItems={drillableItems}
            separators={config?.separators}
            disableDrillUnderline={config?.disableKpiDrillUnderline}
            backend={backend}
            workspace={workspace}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
            isReadOnly={isReadOnly}
        />
    );
};
