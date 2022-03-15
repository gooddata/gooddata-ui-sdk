// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import {
    IAnalyticalBackend,
    IDashboardAttributeFilter,
    IInsightWidget,
    IKpiWidget,
    ILegacyKpi,
} from "@gooddata/sdk-backend-spi";
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
    AttributeFilterComponentProvider,
    InsightComponentProvider,
    InsightMenuButtonComponentProvider,
    InsightMenuComponentProvider,
    KpiComponentProvider,
    WidgetComponentProvider,
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
    selectLocale,
    useDashboardSelector,
    useDispatchDashboardCommand,
} from "../../model";
import { DefaultScheduledEmailDialog, DefaultScheduledEmailManagementDialog } from "../scheduledEmail";
import { DefaultButtonBar, DefaultMenuButton, DefaultTitle, DefaultTopBar } from "../topBar";

import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { IDashboardProps } from "./types";
import { DefaultSaveAsDialog } from "../saveAs";
import { IdentifierRef, idRef, IInsight, UriRef } from "@gooddata/sdk-model";
import { DEFAULT_FILTER_BAR_HEIGHT } from "../constants";
import { DefaultShareDialog } from "../shareDialog";
import { DashboardHeader } from "./DashboardHeader/DashboardHeader";

const DashboardMainContent: React.FC<IDashboardProps> = () => {
    const isFilterBarExpanded = useDashboardSelector(selectFilterBarExpanded);
    const filterBarHeight = useDashboardSelector(selectFilterBarHeight);

    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);

    const dashSectionStyles = useMemo(
        () => ({
            marginTop: isFilterBarExpanded ? filterBarHeight - DEFAULT_FILTER_BAR_HEIGHT + "px" : undefined,
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

interface IUseDashboardResult {
    backend: IAnalyticalBackend;
    workspace: string;
    dashboardOrRef: UriRef | IdentifierRef | undefined;
    hasThemeProvider: boolean;
    attributeFilterProvider: AttributeFilterComponentProvider;
    widgetProvider: WidgetComponentProvider;
    insightProvider: InsightComponentProvider;
    insightMenuButtonProvider: InsightMenuButtonComponentProvider;
    insightMenuProvider: InsightMenuComponentProvider;
    kpiProvider: KpiComponentProvider;
}

const useDashboard = (props: IDashboardProps): IUseDashboardResult => {
    const {
        dashboard,
        DashboardAttributeFilterComponentProvider,
        WidgetComponentProvider,
        InsightComponentProvider,
        InsightMenuButtonComponentProvider,
        insightMenuItemsProvider,
        InsightMenuComponentProvider,
        KpiComponentProvider,
    } = props;

    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);

    const attributeFilterProvider = useCallback(
        (filter: IDashboardAttributeFilter): CustomDashboardAttributeFilterComponent => {
            const userSpecified = DashboardAttributeFilterComponentProvider?.(filter);
            return userSpecified ?? DefaultDashboardAttributeFilter;
        },
        [DashboardAttributeFilterComponentProvider],
    );

    const widgetProvider = useCallback(
        (widget: ExtendedDashboardWidget): CustomDashboardWidgetComponent => {
            const userSpecified = WidgetComponentProvider?.(widget);
            return userSpecified ?? DefaultDashboardWidget;
        },
        [WidgetComponentProvider],
    );

    const insightProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightComponent => {
            const userSpecified = InsightComponentProvider?.(insight, widget);
            return userSpecified ?? DefaultDashboardInsight;
        },
        [InsightComponentProvider],
    );

    const insightMenuButtonProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightMenuButtonComponent => {
            const userSpecified = InsightMenuButtonComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu button
            const FallbackDashboardInsightMenuButtonInner = insightMenuItemsProvider
                ? DefaultDashboardInsightMenuButton
                : LegacyDashboardInsightMenuButton;
            return userSpecified ?? FallbackDashboardInsightMenuButtonInner;
        },
        [InsightMenuButtonComponentProvider],
    );

    const insightMenuProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightMenuComponent => {
            const userSpecified = InsightMenuComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu
            const FallbackDashboardInsightMenuInner = insightMenuItemsProvider
                ? DefaultDashboardInsightMenu
                : LegacyDashboardInsightMenu;
            return userSpecified ?? FallbackDashboardInsightMenuInner;
        },
        [InsightMenuComponentProvider],
    );

    const kpiProvider = useCallback(
        (kpi: ILegacyKpi, widget: IKpiWidget): CustomDashboardKpiComponent => {
            const userSpecified = KpiComponentProvider?.(kpi, widget);
            return userSpecified ?? DefaultDashboardKpi;
        },
        [KpiComponentProvider],
    );

    const dashboardOrRef = useMemo(() => {
        return typeof dashboard === "string" ? idRef(dashboard) : dashboard;
    }, [dashboard]);

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    return {
        backend,
        workspace,
        hasThemeProvider,
        dashboardOrRef,
        attributeFilterProvider,
        widgetProvider,
        insightProvider,
        insightMenuButtonProvider,
        insightMenuProvider,
        kpiProvider,
    };
};

/**
 * @internal
 */
export const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const {
        backend,
        workspace,
        hasThemeProvider,
        dashboardOrRef,
        attributeFilterProvider,
        widgetProvider,
        insightProvider,
        insightMenuButtonProvider,
        insightMenuProvider,
        kpiProvider,
    } = useDashboard(props);

    const dashboardRender = (
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
                                    ScheduledEmailManagementDialogComponent={
                                        props.ScheduledEmailManagementDialogComponent ??
                                        DefaultScheduledEmailManagementDialog
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
        return (
            <ThemeProvider
                theme={props.theme}
                modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                backend={backend}
                workspace={workspace}
            >
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return dashboardRender;
};
