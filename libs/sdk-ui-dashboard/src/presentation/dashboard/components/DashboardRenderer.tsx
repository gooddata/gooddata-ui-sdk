// (C) 2022 GoodData Corporation
import {
    BackendProvider,
    WorkspaceProvider,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
} from "@gooddata/sdk-ui";
import { ToastMessageContextProvider, OverlayProvider } from "@gooddata/sdk-ui-kit";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import React from "react";
import { DashboardStoreProvider } from "../../../model";
import {
    ExportDialogContextProvider,
    DashboardCustomizationsProvider,
    DashboardComponentsProvider,
    DashboardConfigProvider,
} from "../../dashboardContexts";
import { DefaultFilterBar } from "../../filterBar";
import { DefaultDashboardLayout } from "../../layout";
import { DefaultSaveAsDialog } from "../../saveAs";
import { DefaultScheduledEmailDialog, DefaultScheduledEmailManagementDialog } from "../../scheduledEmail";
import { DefaultShareDialog } from "../../shareDialog";
import {
    DefaultButtonBar,
    DefaultMenuButton,
    DefaultSaveButton,
    DefaultTopBar,
    RenderModeAwareTitle,
} from "../../topBar";
import { HiddenToolbar } from "../../toolbar";
import { defaultDashboardThemeModifier } from "../defaultDashboardThemeModifier";
import { useDashboard } from "../hooks/useDashboard";
import { IDashboardProps } from "../types";
import { DashboardLoading } from "./DashboardLoading";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
    DefaultEmptyLayoutDropZoneBody,
    DragNotification,
    LayoutResizeStateProvider,
} from "../../dragAndDrop";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar";

/**
 * @internal
 */
export const DashboardRenderer: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const {
        backend,
        workspace,
        hasThemeProvider,
        dashboardOrRef,
        attributeFilterProvider,
        dateFilterProvider,
        widgetProvider,
        insightProvider,
        insightBodyProvider,
        insightMenuButtonProvider,
        insightMenuProvider,
        kpiProvider,
        insightWidgetComponentSet,
        kpiWidgetComponentSet,
        attributeFilterComponentSet,
    } = useDashboard(props);

    const dashboardRender = (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <DashboardStoreProvider
                    backend={props.backend}
                    workspace={props.workspace}
                    dashboard={dashboardOrRef}
                    persistedDashboard={props.persistedDashboard}
                    filterContextRef={props.filterContextRef}
                    eventHandlers={props.eventHandlers}
                    config={props.config}
                    permissions={props.permissions}
                    onStateChange={props.onStateChange}
                    onEventingInitialized={props.onEventingInitialized}
                    additionalReduxContext={props.additionalReduxContext}
                    customizationFns={props.customizationFns}
                >
                    <ToastMessageContextProvider>
                        <ExportDialogContextProvider>
                            <DashboardCustomizationsProvider
                                insightMenuItemsProvider={props.insightMenuItemsProvider}
                            >
                                <DashboardComponentsProvider
                                    ErrorComponent={props.ErrorComponent ?? DefaultError}
                                    LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                                    LayoutComponent={props.LayoutComponent ?? DefaultDashboardLayout}
                                    InsightComponentProvider={insightProvider}
                                    InsightBodyComponentProvider={insightBodyProvider}
                                    InsightMenuButtonComponentProvider={insightMenuButtonProvider}
                                    InsightMenuComponentProvider={insightMenuProvider}
                                    KpiComponentProvider={kpiProvider}
                                    WidgetComponentProvider={widgetProvider}
                                    ButtonBarComponent={props.ButtonBarComponent ?? DefaultButtonBar}
                                    MenuButtonComponent={props.MenuButtonComponent ?? DefaultMenuButton}
                                    TopBarComponent={props.TopBarComponent ?? DefaultTopBar}
                                    ToolbarComponent={props.ToolbarComponent ?? HiddenToolbar}
                                    TitleComponent={props.TitleComponent ?? RenderModeAwareTitle}
                                    ScheduledEmailDialogComponent={
                                        props.ScheduledEmailDialogComponent ?? DefaultScheduledEmailDialog
                                    }
                                    ScheduledEmailManagementDialogComponent={
                                        props.ScheduledEmailManagementDialogComponent ??
                                        DefaultScheduledEmailManagementDialog
                                    }
                                    ShareDialogComponent={props.ShareDialogComponent ?? DefaultShareDialog}
                                    SaveAsDialogComponent={props.SaveAsDialogComponent ?? DefaultSaveAsDialog}
                                    DashboardAttributeFilterComponentProvider={attributeFilterProvider}
                                    DashboardDateFilterComponentProvider={dateFilterProvider}
                                    FilterBarComponent={props.FilterBarComponent ?? DefaultFilterBar}
                                    SidebarComponent={
                                        props.SidebarComponent ?? RenderModeAwareDashboardSidebar
                                    }
                                    InsightWidgetComponentSet={insightWidgetComponentSet}
                                    KpiWidgetComponentSet={kpiWidgetComponentSet}
                                    AttributeFilterComponentSet={attributeFilterComponentSet}
                                    EmptyLayoutDropZoneBodyComponent={
                                        props.EmptyLayoutDropZoneBodyComponent ??
                                        DefaultEmptyLayoutDropZoneBody
                                    }
                                    SaveButtonComponent={props.SaveButtonComponent ?? DefaultSaveButton}
                                >
                                    <DashboardConfigProvider menuButtonConfig={props.menuButtonConfig}>
                                        <DndProvider backend={HTML5Backend}>
                                            <LayoutResizeStateProvider>
                                                <DragNotification />
                                                <OverlayProvider
                                                    fireGlobalScrollEvent={
                                                        !props.config?.disableCloseOverlaysOnWindowScroll
                                                    }
                                                >
                                                    <DashboardLoading {...props} />
                                                </OverlayProvider>
                                            </LayoutResizeStateProvider>
                                        </DndProvider>
                                    </DashboardConfigProvider>
                                </DashboardComponentsProvider>
                            </DashboardCustomizationsProvider>
                        </ExportDialogContextProvider>
                    </ToastMessageContextProvider>
                </DashboardStoreProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );

    if (props.theme || (!hasThemeProvider && !props.disableThemeLoading)) {
        return (
            <ThemeProvider
                theme={props.theme}
                modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                backend={backend}
                workspace={workspace}
                // Do not remove global theme styles on unmount, if the theme is provided as a prop,
                // and the theme loading is disabled.
                // This avoids flickering of the theme, when switching between the dashboard plugin engine and the default engine.
                removeGlobalStylesOnUnmout={!props.disableThemeLoading}
            >
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return dashboardRender;
};
