// (C) 2020 GoodData Corporation
import React, { useEffect, useMemo } from "react";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { isDashboardLayoutEmpty } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";

import {
    useAttributesWithDrillDown,
    useColorPalette,
    useDashboardLayoutData,
    useUserWorkspaceSettings,
} from "../internal/dashboardEmbedding/hooks";
import { InternalIntlWrapper } from "../internal/utils/internalIntlProvider";
import {
    AttributesWithDrillDownProvider,
    ColorPaletteProvider,
    DashboardAlertsProvider,
    DashboardViewConfigProvider,
    DashboardViewIsReadOnlyProvider,
    UserWorkspaceSettingsProvider,
} from "../internal/dashboardEmbedding/DashboardView/contexts";
import { ScheduledMailDialog } from "../internal/dashboardEmbedding/ScheduledMail/ScheduledMailDialog/ScheduledMailDialog";
import { DashboardRenderer } from "../internal/dashboardEmbedding/DashboardView/DashboardRenderer";
import { filterArrayToFilterContextItems } from "../internal/dashboardEmbedding/utils/filters";

import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { EmptyDashboardError } from "./EmptyDashboardError";
import { useDashboard, useDashboardAlerts } from "./hooks";
import { IDashboardViewConfig, IDashboardViewProps } from "./types";

export const DashboardView: React.FC<IDashboardViewProps> = ({
    dashboard,
    filters,
    onFiltersChange,
    theme,
    disableThemeLoading = false,
    themeModifier = defaultDashboardThemeModifier,
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
    transformLayout,
    isReadOnly = false,
}) => {
    const dashboardRef = typeof dashboard === "string" ? idRef(dashboard, "analyticalDashboard") : dashboard;

    const { error: dashboardError, result: dashboardData, status: dashboardStatus } = useDashboard({
        dashboard: dashboardRef,
        backend,
        workspace,
    });

    const { error: alertsError, result: alertsData, status: alertsStatus } = useDashboardAlerts({
        dashboard: dashboardRef,
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
        error: dashboardLayoutError,
        result: dashboardLayoutResult,
        status: dashboardLayoutStatus,
    } = useDashboardLayoutData({
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
        dashboardLayoutError;

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    useEffect(() => {
        if (
            dashboardData &&
            alertsData &&
            userWorkspaceSettings &&
            colorPalette &&
            drillDownAttributes &&
            dashboardLayoutResult
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
        dashboardLayoutResult,
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

    const sanitizedFilters = useMemo(() => {
        return filters ? filterArrayToFilterContextItems(filters) : undefined;
    }, [filters]);

    const statuses = [
        dashboardStatus,
        alertsStatus,
        userWorkspaceSettingsStatus,
        colorPaletteStatus,
        drillDownAttributesStatus,
        dashboardLayoutStatus,
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
                        <DashboardAlertsProvider alerts={alertsData}>
                            <DashboardViewIsReadOnlyProvider isReadOnly={isReadOnly}>
                                {!isReadOnly && (
                                    <ScheduledMailDialog
                                        backend={backend}
                                        workspace={workspace}
                                        locale={effectiveLocale}
                                        dashboard={dashboardRef}
                                        filters={applyFiltersToScheduledMail ? sanitizedFilters : undefined}
                                        onSubmit={onScheduledMailDialogSubmit}
                                        onSubmitSuccess={onScheduledMailSubmitSuccess}
                                        onSubmitError={onScheduledMailSubmitError}
                                        onCancel={onScheduledMailDialogCancel}
                                        onError={onError}
                                        isVisible={isScheduledMailDialogVisible}
                                    />
                                )}
                                {isDashboardLayoutEmpty(dashboardData.layout) ? (
                                    <EmptyDashboardError ErrorComponent={ErrorComponent} />
                                ) : (
                                    <DashboardRenderer
                                        transformLayout={transformLayout}
                                        backend={backend}
                                        workspace={workspace}
                                        dashboardRef={dashboardRef}
                                        dashboardLayout={dashboardData?.layout}
                                        filters={sanitizedFilters}
                                        onFiltersChange={onFiltersChange}
                                        filterContext={dashboardData.filterContext}
                                        onDrill={onDrill}
                                        drillableItems={drillableItems}
                                        ErrorComponent={ErrorComponent}
                                        LoadingComponent={LoadingComponent}
                                        className="gd-dashboards-root"
                                        getVisType={dashboardLayoutResult.getVisType}
                                        getInsightByRef={dashboardLayoutResult.getInsightByRef}
                                        widgetRenderer={widgetRenderer}
                                        areSectionHeadersEnabled={
                                            userWorkspaceSettings?.areSectionHeadersEnabled
                                        }
                                    />
                                )}
                            </DashboardViewIsReadOnlyProvider>
                        </DashboardAlertsProvider>
                    </AttributesWithDrillDownProvider>
                </ColorPaletteProvider>
            </UserWorkspaceSettingsProvider>
        </DashboardViewConfigProvider>
    );

    if (theme || (!hasThemeProvider && !disableThemeLoading)) {
        dashboardRender = (
            <ThemeProvider theme={theme} backend={backend} workspace={workspace} modifier={themeModifier}>
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return <InternalIntlWrapper locale={effectiveLocale}>{dashboardRender}</InternalIntlWrapper>;
};
