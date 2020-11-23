// (C) 2020 GoodData Corporation
import React, { useEffect } from "react";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { useDashboard } from "../useDashboard";
import { DashboardRenderer } from "./DashboardRenderer";
import { useDashboardAlerts } from "../useDashboardAlerts";
import { IDashboardViewProps } from "./types";

export const DashboardView: React.FC<IDashboardViewProps> = ({
    dashboard,
    filters,
    theme,
    disableThemeLoading = false,
    backend,
    workspace,
    onDrill,
    drillableItems,
    onError,
    onDashboardLoaded,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
}) => {
    const { error: dashboardError, result: dashboardData, status: dashboardStatus } = useDashboard({
        dashboard,
        onError,
        backend,
        workspace,
    });

    const { error: alertsError, result: alertsData, status: alertsStatus } = useDashboardAlerts({
        dashboard,
        onError,
        backend,
        workspace,
    });

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    useEffect(() => {
        if (alertsData && dashboardData) {
            onDashboardLoaded?.({
                alerts: alertsData,
                dashboard: dashboardData,
            });
        }
    }, [onDashboardLoaded, alertsData, dashboardData]);

    const statuses = [dashboardStatus, alertsStatus];

    if (statuses.includes("loading") || statuses.includes("pending")) {
        return <LoadingComponent />;
    }

    if (dashboardStatus === "error") {
        return <ErrorComponent message={dashboardError.message} />;
    }

    if (alertsStatus === "error") {
        return <ErrorComponent message={alertsError.message} />;
    }

    const dashboardRender = (
        <DashboardRenderer
            backend={backend}
            workspace={workspace}
            dashboard={dashboardData}
            alerts={alertsData}
            filters={filters}
            onDrill={onDrill}
            drillableItems={drillableItems}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );

    if (!hasThemeProvider && !disableThemeLoading) {
        return (
            <ThemeProvider theme={theme} backend={backend} workspace={workspace}>
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return dashboardRender;
};
