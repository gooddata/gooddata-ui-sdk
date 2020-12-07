// (C) 2020 GoodData Corporation
import React, { useCallback, useEffect, useMemo } from "react";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardAlerts } from "../hooks/useDashboardAlerts";
import { IDashboardViewConfig, IDashboardViewProps } from "./types";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { useUserWorkspaceSettings } from "../hooks/useUserWorkspaceSettings";
import { DashboardLayoutObtainer } from "./DashboardLayoutObtainer";
import { DashboardViewConfigProvider } from "./DashboardViewConfigContext";

export const DashboardView: React.FC<IDashboardViewProps> = ({
    dashboard,
    filters,
    theme,
    locale,
    disableThemeLoading = false,
    backend,
    workspace,
    onDrill,
    drillableItems,
    onError,
    onDashboardLoaded,
    config,
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

    const effectiveConfig = useMemo<IDashboardViewConfig | undefined>(() => {
        if (!config && !userWorkspaceSettings) {
            return undefined;
        }

        return {
            mapboxToken: config?.mapboxToken,
            separators: config?.separators ?? userWorkspaceSettings?.separators,
            disableKpiDrillUnderline: userWorkspaceSettings?.disableKpiDashboardHeadlineUnderline,
        };
    }, [config, userWorkspaceSettings]);

    const statuses = [dashboardStatus, alertsStatus, userWorkspaceSettingsStatus];

    if (statuses.includes("loading") || statuses.includes("pending")) {
        return <LoadingComponent />;
    }

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    let dashboardRender = (
        <DashboardViewConfigProvider config={effectiveConfig}>
            <DashboardLayoutObtainer
                backend={backend}
                workspace={workspace}
                dashboard={dashboardData}
                alerts={alertsData}
                filters={filters}
                filterContext={dashboardData.filterContext}
                onDrill={onDrill}
                drillableItems={drillableItems}
                ErrorComponent={ErrorComponent}
                LoadingComponent={LoadingComponent}
                onDashboardLoaded={handleDashboardLoaded}
            />
        </DashboardViewConfigProvider>
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
