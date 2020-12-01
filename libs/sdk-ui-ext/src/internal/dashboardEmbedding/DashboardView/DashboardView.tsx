// (C) 2020 GoodData Corporation
import React, { useEffect } from "react";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardRenderer } from "./DashboardRenderer";
import { useDashboardAlerts } from "../hooks/useDashboardAlerts";
import { IDashboardViewProps } from "./types";
import { useDashboardViewLayout } from "../hooks/useDashboardViewLayout";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { useUserWorkspaceSettings } from "../hooks/useUserWorkspaceSettings";

export const DashboardView: React.FC<IDashboardViewProps> = ({
    dashboard,
    filters,
    theme,
    locale,
    separators,
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
        backend,
        workspace,
    });

    const { error: alertsError, result: alertsData, status: alertsStatus } = useDashboardAlerts({
        dashboard,
        backend,
        workspace,
    });

    const {
        error: userWorkspaceSettingsError,
        result: userWorkspaceSettings,
        status: userWorkspaceSettingsStatus,
    } = useUserWorkspaceSettings({
        backend,
        workspace,
    });

    const {
        error: dashboardViewLayoutError,
        result: dashboardViewLayout,
        status: dashboardViewLayoutStatus,
    } = useDashboardViewLayout({
        dashboardLayout: dashboardData?.layout,
        backend,
        workspace,
    });

    const error = dashboardError ?? alertsError ?? userWorkspaceSettingsError ?? dashboardViewLayoutError;

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    useEffect(() => {
        if (
            alertsData &&
            dashboardData &&
            userWorkspaceSettings &&
            dashboardViewLayout &&
            onDashboardLoaded
        ) {
            onDashboardLoaded({
                alerts: alertsData,
                dashboard: dashboardData,
            });
        }
    }, [onDashboardLoaded, alertsData, dashboardData, dashboardViewLayout]);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [onError, error]);

    const statuses = [dashboardStatus, alertsStatus, dashboardViewLayoutStatus, userWorkspaceSettingsStatus];

    if (statuses.includes("loading") || statuses.includes("pending")) {
        return <LoadingComponent />;
    }

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    let dashboardRender = (
        <DashboardRenderer
            backend={backend}
            workspace={workspace}
            dashboardViewLayout={dashboardViewLayout}
            alerts={alertsData}
            filters={filters}
            filterContext={dashboardData.filterContext}
            onDrill={onDrill}
            drillableItems={drillableItems}
            separators={separators ?? userWorkspaceSettings.separators}
            disableKpiDrillUnderline={userWorkspaceSettings.disableKpiDashboardHeadlineUnderline}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );

    if (!hasThemeProvider && !disableThemeLoading) {
        dashboardRender = (
            <ThemeProvider theme={theme} backend={backend} workspace={workspace}>
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return (
        <InternalIntlWrapper locale={locale ?? userWorkspaceSettings.locale}>
            {dashboardRender}
        </InternalIntlWrapper>
    );
};
