// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { IDashboardAttributeFilter, IInsightWidget, IKpiWidget, ILegacyKpi } from "@gooddata/sdk-backend-spi";
import { ToastMessageContextProvider } from "@gooddata/sdk-ui-kit";
import {
    BackendProvider,
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    useBackendStrict,
    useWorkspaceStrict,
    WorkspaceProvider,
} from "@gooddata/sdk-ui";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";

import {
    DashboardComponentsProvider,
    DashboardConfigProvider,
    DashboardCustomizationsProvider,
    ExportDialogContextProvider,
    useDashboardComponentsContext,
} from "../dashboardContexts";
import {
    CustomDashboardAttributeFilterComponent,
    DefaultDashboardAttributeFilter,
    DefaultDashboardDateFilter,
    DefaultFilterBar,
} from "../filterBar";
import {
    CustomDashboardInsightComponent,
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardKpiComponent,
    CustomDashboardWidgetComponent,
    DefaultDashboardInsight,
    DefaultDashboardInsightMenu,
    DefaultDashboardInsightMenuButton,
    DefaultDashboardKpi,
    DefaultDashboardWidget,
    LegacyDashboardInsightMenu,
    LegacyDashboardInsightMenuButton,
} from "../widget";
import { DashboardLayout, DefaultDashboardLayout } from "../layout";
import { IntlWrapper } from "../localization";
import {
    changeFilterContextSelection,
    DashboardStoreProvider,
    ExtendedDashboardWidget,
    selectDashboardLoading,
    selectFilterBarExpanded,
    selectFilterBarHeight,
    selectIsEmbedded,
    selectLocale,
    useDashboardSelector,
    useDispatchDashboardCommand,
} from "../../model";
import { DefaultScheduledEmailDialog } from "../scheduledEmail";
import { DefaultButtonBar, DefaultMenuButton, DefaultTitle, DefaultTopBar } from "../topBar";

import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { IDashboardProps } from "./types";
import { DefaultSaveAsDialog } from "../saveAs";
import { idRef, IInsight } from "@gooddata/sdk-model";
import { DEFAULT_FILTER_BAR_HEIGHT } from "../constants";
import { DefaultShareDialog } from "../shareDialog";
import { DashboardHeader } from "./DashboardHeader/DashboardHeader";

const DashboardMainContent: React.FC<IDashboardProps> = () => {
    const isFilterBarExpanded = useDashboardSelector(selectFilterBarExpanded);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const filterBarHeight = useDashboardSelector(selectFilterBarHeight);

    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);

    const dashSectionStyles = useMemo(
        () => ({
            marginTop:
                isFilterBarExpanded && !isEmbedded
                    ? filterBarHeight - DEFAULT_FILTER_BAR_HEIGHT + "px"
                    : undefined,
            transition: "margin-top 0.2s",
        }),
        [isFilterBarExpanded, filterBarHeight],
    );

    return (
        <div className="gd-flex-item-stretch dash-section dash-section-kpis" style={dashSectionStyles}>
            <div className="gd-flex-container root-flex-maincontent">
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        </div>
    );
};

const DashboardInner: React.FC<IDashboardProps> = () => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <div className="gd-dashboards-root">
                <div className="gd-dash-header-wrapper">
                    <DashboardHeader />
                </div>
                <DashboardMainContent />
            </div>
        </IntlWrapper>
    );
};

const DashboardLoading: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (loading || !result) {
        return <LoadingComponent />;
    }

    return <DashboardInner {...props} />;
};

/**
 * @internal
 */
export const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);

    const attributeFilterProvider = useCallback(
        (filter: IDashboardAttributeFilter): CustomDashboardAttributeFilterComponent => {
            const userSpecified = props.DashboardAttributeFilterComponentProvider?.(filter);
            return userSpecified ?? DefaultDashboardAttributeFilter;
        },
        [props.DashboardAttributeFilterComponentProvider],
    );

    const widgetProvider = useCallback(
        (widget: ExtendedDashboardWidget): CustomDashboardWidgetComponent => {
            const userSpecified = props.WidgetComponentProvider?.(widget);
            return userSpecified ?? DefaultDashboardWidget;
        },
        [props.WidgetComponentProvider],
    );

    const insightProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightComponent => {
            const userSpecified = props.InsightComponentProvider?.(insight, widget);
            return userSpecified ?? DefaultDashboardInsight;
        },
        [props.InsightComponentProvider],
    );

    const insightMenuButtonProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightMenuButtonComponent => {
            const userSpecified = props.InsightMenuButtonComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu button
            const FallbackDashboardInsightMenuButtonInner = props.insightMenuItemsProvider
                ? DefaultDashboardInsightMenuButton
                : LegacyDashboardInsightMenuButton;
            return userSpecified ?? FallbackDashboardInsightMenuButtonInner;
        },
        [props.InsightMenuButtonComponentProvider],
    );

    const insightMenuProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightMenuComponent => {
            const userSpecified = props.InsightMenuComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu
            const FallbackDashboardInsightMenuInner = props.insightMenuItemsProvider
                ? DefaultDashboardInsightMenu
                : LegacyDashboardInsightMenu;
            return userSpecified ?? FallbackDashboardInsightMenuInner;
        },
        [props.InsightMenuComponentProvider],
    );

    const kpiProvider = useCallback(
        (kpi: ILegacyKpi, widget: IKpiWidget): CustomDashboardKpiComponent => {
            const userSpecified = props.KpiComponentProvider?.(kpi, widget);
            return userSpecified ?? DefaultDashboardKpi;
        },
        [props.KpiComponentProvider],
    );

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;
    const { dashboard } = props;
    const dashboardOrRef = typeof dashboard === "string" ? idRef(dashboard) : dashboard;

    let dashboardRender = (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <DashboardStoreProvider
                    backend={props.backend}
                    workspace={props.workspace}
                    dashboard={dashboardOrRef}
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
                                enableSaveAsNewButton={props.enableSaveAsNewButton}
                            >
                                <DashboardComponentsProvider
                                    ErrorComponent={props.ErrorComponent ?? DefaultError}
                                    LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                                    LayoutComponent={props.LayoutComponent ?? DefaultDashboardLayout}
                                    InsightComponentProvider={insightProvider}
                                    InsightMenuButtonComponentProvider={insightMenuButtonProvider}
                                    InsightMenuComponentProvider={insightMenuProvider}
                                    KpiComponentProvider={kpiProvider}
                                    WidgetComponentProvider={widgetProvider}
                                    ButtonBarComponent={props.ButtonBarComponent ?? DefaultButtonBar}
                                    MenuButtonComponent={props.MenuButtonComponent ?? DefaultMenuButton}
                                    TopBarComponent={props.TopBarComponent ?? DefaultTopBar}
                                    TitleComponent={props.TitleComponent ?? DefaultTitle}
                                    ScheduledEmailDialogComponent={
                                        props.ScheduledEmailDialogComponent ?? DefaultScheduledEmailDialog
                                    }
                                    ShareDialogComponent={props.ShareDialogComponent ?? DefaultShareDialog}
                                    SaveAsDialogComponent={props.SaveAsDialogComponent ?? DefaultSaveAsDialog}
                                    DashboardAttributeFilterComponentProvider={attributeFilterProvider}
                                    DashboardDateFilterComponent={
                                        props.DashboardDateFilterComponent ?? DefaultDashboardDateFilter
                                    }
                                    FilterBarComponent={props.FilterBarComponent ?? DefaultFilterBar}
                                >
                                    <DashboardConfigProvider menuButtonConfig={props.menuButtonConfig}>
                                        <DashboardLoading {...props} />
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
        dashboardRender = (
            <ThemeProvider
                theme={props.theme}
                modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                backend={props.backend}
                workspace={props.workspace}
            >
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return dashboardRender;
};
