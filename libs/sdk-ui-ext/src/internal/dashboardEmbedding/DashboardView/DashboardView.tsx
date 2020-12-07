// (C) 2020 GoodData Corporation
import React, { useCallback, useEffect } from "react";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardAlerts } from "../hooks/useDashboardAlerts";
import { IDashboardViewProps } from "./types";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { useUserWorkspaceSettings } from "../hooks/useUserWorkspaceSettings";
import { DashboardLayoutObtainer } from "./DashboardLayoutObtainer";

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

    const handleDashboardLoaded = useCallback(() => {
        onDashboardLoaded?.({
            alerts: alertsData,
            dashboard: dashboardData,
        });
    }, [onDashboardLoaded, alertsData, dashboardData]);

    const error = dashboardError ?? alertsError ?? userWorkspaceSettingsError;

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [onError, error]);

    const statuses = [dashboardStatus, alertsStatus, userWorkspaceSettingsStatus];

    if (statuses.includes("loading") || statuses.includes("pending")) {
        return <LoadingComponent />;
    }

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    let dashboardRender = (
        <DashboardLayoutObtainer
            backend={backend}
            workspace={workspace}
            dashboard={dashboardData}
            alerts={alertsData}
            filters={filters}
            filterContext={dashboardData.filterContext}
            onDrill={onDrill}
            drillableItems={drillableItems}
            separators={separators ?? userWorkspaceSettings.separators}
            disableKpiDrillUnderline={userWorkspaceSettings.disableKpiDashboardHeadlineUnderline}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
            onDashboardLoaded={handleDashboardLoaded}
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
