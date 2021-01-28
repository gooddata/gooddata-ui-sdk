// (C) 2020 GoodData Corporation
import React, { useEffect, useMemo } from "react";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { isFluidLayoutEmpty } from "@gooddata/sdk-backend-spi";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardAlerts } from "../hooks/useDashboardAlerts";
import { IDashboardViewConfig, IDashboardViewProps } from "./types";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { useUserWorkspaceSettings } from "../hooks/useUserWorkspaceSettings";
import { useColorPalette } from "../hooks/useColorPalette";
import { DashboardViewConfigProvider } from "./DashboardViewConfigContext";
import { UserWorkspaceSettingsProvider } from "./UserWorkspaceSettingsContext";
import { ColorPaletteProvider } from "./ColorPaletteContext";
import { defaultThemeModifier } from "./defaultThemeModifier";
import { ScheduledMailDialog } from "../ScheduledMail/ScheduledMailDialog/ScheduledMailDialog";
import { AttributesWithDrillDownProvider } from "./AttributesWithDrillDownContext";
import { useAttributesWithDrillDown } from "../hooks/useAttributesWithDrillDown";
import { useDashboardViewLayout } from "../hooks/useDashboardViewLayout";
import { DashboardRenderer } from "./DashboardRenderer";
import { EmptyDashboardError } from "./EmptyDashboardError";

export const DashboardView: React.FC<IDashboardViewProps> = ({
    dashboard,
    filters,
    theme,
    disableThemeLoading = false,
    themeModifier = defaultThemeModifier,
    backend,
    workspace,
    onDrill,
    drillableItems,
    onError,
    onDashboardLoaded,
    config,
    isScheduledMailDialogVisible,
    applyFiltersToScheduledMail = true,
    onScheduledMailDialogCancel,
    onScheduledMailDialogSubmit,
    onScheduledMailSubmitError,
    onScheduledMailSubmitSuccess,
    ErrorComponent = DefaultError,
    LoadingComponent = DefaultLoading,
    widgetRenderer,
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

    const { error: colorPaletteError, result: colorPalette, status: colorPaletteStatus } = useColorPalette({
        backend,
        workspace,
    });

    const {
        error: drillDownAttributesError,
        result: drillDownAttributes,
        status: drillDownAttributesStatus,
    } = useAttributesWithDrillDown({
        hasDrillingEnabled: !!onDrill,
        backend,
        workspace,
    });

    const {
        error: dashboardViewLayoutError,
        result: dashboardViewLayoutResult,
        status: dashboardViewLayoutStatus,
    } = useDashboardViewLayout({
        dashboardLayout: dashboardData?.layout,
        backend,
        workspace,
    });

    const error =
        dashboardError ??
        alertsError ??
        userWorkspaceSettingsError ??
        colorPaletteError ??
        drillDownAttributesError ??
        dashboardViewLayoutError;

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    useEffect(() => {
        if (
            dashboardData &&
            alertsData &&
            userWorkspaceSettings &&
            colorPalette &&
            drillDownAttributes &&
            dashboardViewLayoutResult
        ) {
            onDashboardLoaded?.({
                alerts: alertsData,
                dashboard: dashboardData,
            });
        }
    }, [
        onDashboardLoaded,
        dashboardData,
        alertsData,
        userWorkspaceSettings,
        colorPalette,
        drillDownAttributes,
        dashboardViewLayoutResult,
    ]);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [onError, error]);

    const effectiveLocale = config?.locale ?? userWorkspaceSettings?.locale;
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

    const statuses = [
        dashboardStatus,
        alertsStatus,
        userWorkspaceSettingsStatus,
        colorPaletteStatus,
        drillDownAttributesStatus,
        dashboardViewLayoutStatus,
    ];

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (statuses.includes("loading") || statuses.includes("pending")) {
        return <LoadingComponent />;
    }

    let dashboardRender = (
        <DashboardViewConfigProvider config={effectiveConfig}>
            <UserWorkspaceSettingsProvider settings={userWorkspaceSettings}>
                <ColorPaletteProvider palette={colorPalette}>
                    <AttributesWithDrillDownProvider attributes={drillDownAttributes}>
                        <ScheduledMailDialog
                            backend={backend}
                            workspace={workspace}
                            locale={effectiveLocale}
                            dashboard={dashboard}
                            filters={applyFiltersToScheduledMail ? filters : undefined}
                            onSubmit={onScheduledMailDialogSubmit}
                            onSubmitSuccess={onScheduledMailSubmitSuccess}
                            onSubmitError={onScheduledMailSubmitError}
                            onCancel={onScheduledMailDialogCancel}
                            onError={onError}
                            isVisible={isScheduledMailDialogVisible}
                        />

                        {isFluidLayoutEmpty(dashboardData.layout) ? (
                            <EmptyDashboardError ErrorComponent={ErrorComponent} />
                        ) : (
                            <DashboardRenderer
                                backend={backend}
                                workspace={workspace}
                                dashboardViewLayout={dashboardData?.layout}
                                alerts={alertsData}
                                filters={filters}
                                filterContext={dashboardData.filterContext}
                                onDrill={onDrill}
                                drillableItems={drillableItems}
                                ErrorComponent={ErrorComponent}
                                LoadingComponent={LoadingComponent}
                                className="gd-dashboards-root"
                                getDashboardViewLayoutWidgetClass={
                                    dashboardViewLayoutResult.getDashboardViewLayoutWidgetClass
                                }
                                getInsightByRef={dashboardViewLayoutResult.getInsightByRef}
                                widgetRenderer={widgetRenderer}
                            />
                        )}
                    </AttributesWithDrillDownProvider>
                </ColorPaletteProvider>
            </UserWorkspaceSettingsProvider>
        </DashboardViewConfigProvider>
    );

    if (!hasThemeProvider && !disableThemeLoading) {
        dashboardRender = (
            <ThemeProvider theme={theme} backend={backend} workspace={workspace} modifier={themeModifier}>
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return <InternalIntlWrapper locale={effectiveLocale}>{dashboardRender}</InternalIntlWrapper>;
};
