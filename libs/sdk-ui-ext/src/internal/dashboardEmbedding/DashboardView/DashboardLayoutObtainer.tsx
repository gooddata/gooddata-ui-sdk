// (C) 2020 GoodData Corporation
import React, { useEffect } from "react";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    OnError,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import { DashboardRenderer } from "./DashboardRenderer";
import { useDashboardViewLayout } from "../hooks/useDashboardViewLayout";
import {
    IAnalyticalBackend,
    IDashboard,
    IFilterContext,
    ISeparators,
    ITempFilterContext,
    IWidgetAlert,
} from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";

interface IDashboardLayoutObtainerProps {
    dashboard: IDashboard;
    alerts: IWidgetAlert[];
    backend: IAnalyticalBackend;
    workspace: string;
    separators: ISeparators;
    disableKpiDrillUnderline?: boolean;
    filters?: IFilter[];
    filterContext?: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
    onDashboardLoaded: () => void;
}

export const DashboardLayoutObtainer: React.FC<IDashboardLayoutObtainerProps> = ({
    dashboard,
    alerts,
    filters,
    separators,
    backend,
    workspace,
    onDrill,
    drillableItems,
    onError,
    onDashboardLoaded,
    disableKpiDrillUnderline,
    ErrorComponent,
    LoadingComponent,
}) => {
    const { error, result: dashboardViewLayout, status: dashboardViewLayoutStatus } = useDashboardViewLayout({
        dashboardLayout: dashboard.layout,
        backend,
        workspace,
    });

    useEffect(() => {
        if (dashboardViewLayout) {
            onDashboardLoaded();
        }
    }, [onDashboardLoaded, dashboardViewLayout]);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [onError, error]);

    if (dashboardViewLayoutStatus === "loading" || dashboardViewLayoutStatus === "pending") {
        return <LoadingComponent />;
    }

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    return (
        <DashboardRenderer
            backend={backend}
            workspace={workspace}
            dashboardViewLayout={dashboardViewLayout}
            alerts={alerts}
            filters={filters}
            filterContext={dashboard.filterContext}
            onDrill={onDrill}
            drillableItems={drillableItems}
            separators={separators}
            disableKpiDrillUnderline={disableKpiDrillUnderline}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );
};
