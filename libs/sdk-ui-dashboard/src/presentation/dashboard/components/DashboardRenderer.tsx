// (C) 2022 GoodData Corporation
import {
    BackendProvider,
    WorkspaceProvider,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
} from "@gooddata/sdk-ui";
import {
    OverlayControllerProvider,
    OverlayController,
    ToastMessageContextProvider,
} from "@gooddata/sdk-ui-kit";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import React from "react";
import { DashboardStoreProvider } from "../../../model/index.js";
import {
    ExportDialogContextProvider,
    DashboardCustomizationsProvider,
    DashboardComponentsProvider,
    DashboardConfigProvider,
} from "../../dashboardContexts/index.js";
import { DefaultFilterBar } from "../../filterBar/index.js";
import { DefaultDashboardLayout } from "../../layout/index.js";
import { DefaultSaveAsDialog } from "../../saveAs/index.js";
import {
    DefaultScheduledEmailDialog,
    DefaultScheduledEmailManagementDialog,
} from "../../scheduledEmail/index.js";
import { DefaultShareDialog } from "../../shareDialog/index.js";
import {
    DefaultButtonBar,
    DefaultMenuButton,
    DefaultSaveButton,
    DefaultTopBar,
    RenderModeAwareTitle,
} from "../../topBar/index.js";
import { HiddenToolbar } from "../../toolbar/index.js";
import { defaultDashboardThemeModifier } from "../defaultDashboardThemeModifier.js";
import { useDashboard } from "../hooks/useDashboard.js";
import { IDashboardProps } from "../types.js";
import { DashboardLoading } from "./DashboardLoading.js";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DefaultEmptyLayoutDropZoneBody, LayoutResizeStateProvider } from "../../dragAndDrop/index.js";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar.js";
import { DASHBOARD_OVERLAYS_Z_INDEX } from "../../constants/index.js";

const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_Z_INDEX);
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
        insightMenuTitleProvider,
        kpiProvider,
        insightWidgetComponentSet,
        kpiWidgetComponentSet,
        attributeFilterComponentSet,
    } = useDashboard(props);

    const dashboardRender = (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <OverlayControllerProvider overlayController={overlayController}>
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
                        widgetsOverlayFn={props.widgetsOverlayFn}
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
                                        InsightMenuTitleComponentProvider={insightMenuTitleProvider}
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
                                        ShareDialogComponent={
                                            props.ShareDialogComponent ?? DefaultShareDialog
                                        }
                                        SaveAsDialogComponent={
                                            props.SaveAsDialogComponent ?? DefaultSaveAsDialog
                                        }
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
                                                    <DashboardLoading {...props} />
                                                </LayoutResizeStateProvider>
                                            </DndProvider>
                                        </DashboardConfigProvider>
                                    </DashboardComponentsProvider>
                                </DashboardCustomizationsProvider>
                            </ExportDialogContextProvider>
                        </ToastMessageContextProvider>
                    </DashboardStoreProvider>
                </OverlayControllerProvider>
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
