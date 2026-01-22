// (C) 2022-2026 GoodData Corporation

import { DndProvider } from "@evil-internetmann/react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
    BackendProvider,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    WorkspaceProvider,
} from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import { DashboardItemPathAndSizeProvider } from "./DashboardItemPathAndSizeContext.js";
import { DashboardLoading } from "./DashboardLoading.js";
import { DashboardStoreProvider } from "../../../model/react/DashboardStoreProvider.js";
import { DefaultAlertingDialogNew } from "../../alerting/DefaultAlertingDialog/DefaultAlertingDialogNew.js";
import { DefaultAlertingManagementDialogNew } from "../../alerting/DefaultAlertingManagementDialog/DefaultAlertingManagementDialogNew.js";
import { DASHBOARD_OVERLAYS_Z_INDEX } from "../../constants/zIndex.js";
import { DashboardComponentsProvider } from "../../dashboardContexts/DashboardComponentsContext.js";
import { DashboardConfigProvider } from "../../dashboardContexts/DashboardConfigContext.js";
import { DashboardCustomizationsProvider } from "../../dashboardContexts/DashboardCustomizationsContext.js";
import { ExportTabularPdfDialogContextProvider } from "../../dashboardContexts/ExportTabularPdfDialogContext.js";
import { ExportXlsxDialogContextProvider } from "../../dashboardContexts/ExportXlsxDialogContext.js";
import { DefaultDashboardSettingsDialog } from "../../dashboardSettingsDialog/DefaultDashboardSettingsDialog.js";
import { DefaultEmptyLayoutDropZoneBody } from "../../dragAndDrop/draggableWidget/DefaultEmptyLayoutDropZoneBody.js";
import { HoveredWidgetProvider } from "../../dragAndDrop/HoveredWidgetContext.js";
import { LayoutResizeStateProvider } from "../../dragAndDrop/LayoutResizeContext.js";
import { RenderModeAwareFilterBar } from "../../filterBar/filterBar/RenderModeAwareFilterBar.js";
import { DefaultDashboardLayout } from "../../flexibleLayout/DefaultDashboardLayout.js";
import { DefaultSaveAsDialog } from "../../saveAs/DefaultSaveAsDialog/index.js";
import { DefaultScheduledEmailDialog } from "../../scheduledEmail/DefaultScheduledEmailDialog/DefaultScheduledEmailDialog.js";
import { ScheduledEmailManagementDialog as DefaultScheduledEmailManagementDialog } from "../../scheduledEmail/DefaultScheduledEmailManagementDialog/DefaultScheduledEmailManagementDialog.js";
import { DefaultShareDialog } from "../../shareDialog/DefaultShareDialog.js";
import { HiddenToolbar } from "../../toolbar/HiddenToolbar.js";
import { DefaultSaveButton } from "../../topBar/buttonBar/button/saveButton/DefaultSaveButton.js";
import { DefaultSettingButton } from "../../topBar/buttonBar/button/settingButton/DefaultSettingButton.js";
import { DefaultButtonBar } from "../../topBar/buttonBar/DefaultButtonBar.js";
import { DefaultMenuButton } from "../../topBar/menuButton/DefaultMenuButton.js";
import { RenderModeAwareTitle } from "../../topBar/title/RenderModeAwareTitle.js";
import { RenderModeAwareTopBar } from "../../topBar/topBar/RenderModeAwareTopBar.js";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar.js";
import { defaultDashboardThemeModifier } from "../defaultDashboardThemeModifier.js";
import { useDashboard } from "../hooks/useDashboard.js";
import { type IDashboardProps } from "../types.js";

const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_Z_INDEX);

function resolveCoreComponents(props: IDashboardProps) {
    return {
        ErrorComponent: props.ErrorComponent ?? DefaultError,
        LoadingComponent: props.LoadingComponent ?? DefaultLoading,
        LayoutComponent: props.LayoutComponent ?? DefaultDashboardLayout,
        ButtonBarComponent: props.ButtonBarComponent ?? DefaultButtonBar,
        MenuButtonComponent: props.MenuButtonComponent ?? DefaultMenuButton,
        TopBarComponent: props.TopBarComponent ?? RenderModeAwareTopBar,
        ToolbarComponent: props.ToolbarComponent ?? HiddenToolbar,
        TitleComponent: props.TitleComponent ?? RenderModeAwareTitle,
    };
}

function resolveDialogComponents(props: IDashboardProps) {
    return {
        ScheduledEmailDialogComponent: props.ScheduledEmailDialogComponent ?? DefaultScheduledEmailDialog,
        ScheduledEmailManagementDialogComponent:
            props.ScheduledEmailManagementDialogComponent ?? DefaultScheduledEmailManagementDialog,
        ShareDialogComponent: props.ShareDialogComponent ?? DefaultShareDialog,
        AlertingManagementDialogComponent:
            props.AlertingManagementDialogComponent ?? DefaultAlertingManagementDialogNew,
        AlertingDialogComponent: props.AlertingDialogComponent ?? DefaultAlertingDialogNew,
        SaveAsDialogComponent: props.SaveAsDialogComponent ?? DefaultSaveAsDialog,
        DashboardSettingsDialogComponent:
            props.DashboardSettingsDialogComponent ?? DefaultDashboardSettingsDialog,
    };
}

function resolveLayoutComponents(props: IDashboardProps) {
    return {
        FilterBarComponent: props.FilterBarComponent ?? RenderModeAwareFilterBar,
        SidebarComponent: props.SidebarComponent ?? RenderModeAwareDashboardSidebar,
        EmptyLayoutDropZoneBodyComponent:
            props.EmptyLayoutDropZoneBodyComponent ?? DefaultEmptyLayoutDropZoneBody,
        SaveButtonComponent: props.SaveButtonComponent ?? DefaultSaveButton,
        SettingButtonComponent: props.SettingButtonComponent ?? DefaultSettingButton,
    };
}

function resolveComponentsWithDefaults(props: IDashboardProps) {
    return {
        ...resolveCoreComponents(props),
        ...resolveDialogComponents(props),
        ...resolveLayoutComponents(props),
    };
}

function shouldUseThemeProvider(props: IDashboardProps, hasThemeProvider: boolean): boolean {
    return Boolean(props.theme || (!hasThemeProvider && !props.disableThemeLoading));
}

/**
 * @internal
 */
export function DashboardRenderer(props: IDashboardProps) {
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
        dashboardContentProvider,
        insightMenuProvider,
        richTextMenuProvider,
        richTextMenuTitleProvider,
        insightMenuTitleProvider,
        insightWidgetComponentSet,
        attributeFilterComponentSet,
        dateFilterComponentSet,
        richTextProvider,
        visualizationSwitcherProvider,
        richTextWidgetComponentSet,
        visualizationSwitcherWidgetComponentSet,
        visualizationSwitcherToolbarComponentProvider,
        dashboardLayoutWidgetComponentSet,
        showAsTableButtonComponentProvider,
    } = useDashboard(props);

    const components = resolveComponentsWithDefaults(props);

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
                        initialTabId={props.initialTabId}
                    >
                        <ExportXlsxDialogContextProvider>
                            <ExportTabularPdfDialogContextProvider>
                                <DashboardCustomizationsProvider
                                    insightMenuItemsProvider={props.insightMenuItemsProvider}
                                    richTextMenuItemsProvider={props.richTextMenuItemsProvider}
                                    existingExportTransformFn={
                                        props.customizationFns?.existingExportTransformFn
                                    }
                                    slideConfig={props.config?.slideConfig}
                                >
                                    <DashboardComponentsProvider
                                        ErrorComponent={components.ErrorComponent}
                                        LoadingComponent={components.LoadingComponent}
                                        LayoutComponent={components.LayoutComponent}
                                        InsightComponentProvider={insightProvider}
                                        InsightBodyComponentProvider={insightBodyProvider}
                                        InsightMenuButtonComponentProvider={insightMenuButtonProvider}
                                        InsightMenuTitleComponentProvider={insightMenuTitleProvider}
                                        InsightMenuComponentProvider={insightMenuProvider}
                                        VisualizationSwitcherToolbarComponentProvider={
                                            visualizationSwitcherToolbarComponentProvider
                                        }
                                        RichTextComponentProvider={richTextProvider}
                                        RichTextMenuComponentProvider={richTextMenuProvider}
                                        RichTextMenuTitleComponentProvider={richTextMenuTitleProvider}
                                        VisualizationSwitcherComponentProvider={visualizationSwitcherProvider}
                                        WidgetComponentProvider={widgetProvider}
                                        ButtonBarComponent={components.ButtonBarComponent}
                                        MenuButtonComponent={components.MenuButtonComponent}
                                        TopBarComponent={components.TopBarComponent}
                                        ToolbarComponent={components.ToolbarComponent}
                                        TitleComponent={components.TitleComponent}
                                        ScheduledEmailDialogComponent={
                                            components.ScheduledEmailDialogComponent
                                        }
                                        ScheduledEmailManagementDialogComponent={
                                            components.ScheduledEmailManagementDialogComponent
                                        }
                                        ShareDialogComponent={components.ShareDialogComponent}
                                        AlertingManagementDialogComponent={
                                            components.AlertingManagementDialogComponent
                                        }
                                        AlertingDialogComponent={components.AlertingDialogComponent}
                                        SaveAsDialogComponent={components.SaveAsDialogComponent}
                                        DashboardAttributeFilterComponentProvider={attributeFilterProvider}
                                        DashboardDateFilterComponentProvider={dateFilterProvider}
                                        FilterBarComponent={components.FilterBarComponent}
                                        SidebarComponent={components.SidebarComponent}
                                        InsightWidgetComponentSet={insightWidgetComponentSet}
                                        RichTextWidgetComponentSet={richTextWidgetComponentSet}
                                        VisualizationSwitcherWidgetComponentSet={
                                            visualizationSwitcherWidgetComponentSet
                                        }
                                        DashboardLayoutWidgetComponentSet={dashboardLayoutWidgetComponentSet}
                                        AttributeFilterComponentSet={attributeFilterComponentSet}
                                        DateFilterComponentSet={dateFilterComponentSet}
                                        EmptyLayoutDropZoneBodyComponent={
                                            components.EmptyLayoutDropZoneBodyComponent
                                        }
                                        SaveButtonComponent={components.SaveButtonComponent}
                                        DashboardContentComponentProvider={dashboardContentProvider}
                                        SettingButtonComponent={components.SettingButtonComponent}
                                        DashboardSettingsDialogComponent={
                                            components.DashboardSettingsDialogComponent
                                        }
                                        ShowAsTableButtonComponentProvider={
                                            showAsTableButtonComponentProvider
                                        }
                                    >
                                        <DashboardConfigProvider menuButtonConfig={props.menuButtonConfig}>
                                            <DndProvider backend={HTML5Backend}>
                                                <LayoutResizeStateProvider>
                                                    <DashboardItemPathAndSizeProvider>
                                                        <HoveredWidgetProvider>
                                                            <DashboardLoading {...props} />
                                                        </HoveredWidgetProvider>
                                                    </DashboardItemPathAndSizeProvider>
                                                </LayoutResizeStateProvider>
                                            </DndProvider>
                                        </DashboardConfigProvider>
                                    </DashboardComponentsProvider>
                                </DashboardCustomizationsProvider>
                            </ExportTabularPdfDialogContextProvider>
                        </ExportXlsxDialogContextProvider>
                    </DashboardStoreProvider>
                </OverlayControllerProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );

    if (shouldUseThemeProvider(props, hasThemeProvider)) {
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
}
