// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { IDashboardAttributeFilter, IInsightWidget, IKpiWidget, ILegacyKpi } from "@gooddata/sdk-backend-spi";
import { ToastMessageContextProvider } from "@gooddata/sdk-ui-kit";
import { ErrorComponent as DefaultError, LoadingComponent as DefaultLoading } from "@gooddata/sdk-ui";
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
    DefaultDashboardAttributeFilterInner,
    DefaultDashboardDateFilterInner,
    DefaultFilterBarInner,
} from "../filterBar";
import {
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardWidgetComponent,
    DefaultDashboardInsightInner,
    DefaultDashboardInsightMenuButtonInner,
    DefaultDashboardInsightMenuInner,
    DefaultDashboardKpiInner,
    DefaultDashboardWidgetInner,
    LegacyDashboardInsightMenuButtonInner,
    LegacyDashboardInsightMenuInner,
} from "../widget";
import { DashboardLayout, DashboardLayoutPropsProvider, DefaultDashboardLayoutInner } from "../layout";
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
import { DefaultScheduledEmailDialogInner } from "../scheduledEmail";
import {
    DefaultButtonBarInner,
    DefaultMenuButtonInner,
    DefaultTitleInner,
    DefaultTopBarInner,
} from "../topBar";

import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { IDashboardProps } from "./types";
import { DefaultSaveAsDialogInner } from "../saveAs";
import { IInsight } from "@gooddata/sdk-model";
import { DEFAULT_FILTER_BAR_HEIGHT } from "../constants";
import { DefaultShareDialogInner } from "../shareDialog";
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
                <DashboardLayoutPropsProvider onFiltersChange={onFiltersChange}>
                    <DashboardLayout />
                </DashboardLayoutPropsProvider>
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
    const attributeFilterProvider = useCallback(
        (filter: IDashboardAttributeFilter): CustomDashboardAttributeFilterComponent => {
            const userSpecified = props.DashboardAttributeFilterComponentProvider?.(filter);
            return userSpecified ?? DefaultDashboardAttributeFilterInner;
        },
        [props.DashboardAttributeFilterComponentProvider],
    );

    const widgetProvider = useCallback(
        (widget: ExtendedDashboardWidget): CustomDashboardWidgetComponent => {
            const userSpecified = props.WidgetComponentProvider?.(widget);
            return userSpecified ?? DefaultDashboardWidgetInner;
        },
        [props.WidgetComponentProvider],
    );

    const insightProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardWidgetComponent => {
            const userSpecified = props.InsightComponentProvider?.(insight, widget);
            return userSpecified ?? DefaultDashboardInsightInner;
        },
        [props.InsightComponentProvider],
    );

    const insightMenuButtonProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightMenuButtonComponent => {
            const userSpecified = props.InsightMenuButtonComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu button
            const FallbackDashboardInsightMenuButtonInner = props.insightMenuItemsProvider
                ? DefaultDashboardInsightMenuButtonInner
                : LegacyDashboardInsightMenuButtonInner;
            return userSpecified ?? FallbackDashboardInsightMenuButtonInner;
        },
        [props.InsightMenuButtonComponentProvider],
    );

    const insightMenuProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomDashboardInsightMenuComponent => {
            const userSpecified = props.InsightMenuComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu
            const FallbackDashboardInsightMenuInner = props.insightMenuItemsProvider
                ? DefaultDashboardInsightMenuInner
                : LegacyDashboardInsightMenuInner;
            return userSpecified ?? FallbackDashboardInsightMenuInner;
        },
        [props.InsightMenuComponentProvider],
    );

    const kpiProvider = useCallback(
        (kpi: ILegacyKpi, widget: IKpiWidget): CustomDashboardWidgetComponent => {
            const userSpecified = props.KpiComponentProvider?.(kpi, widget);
            return userSpecified ?? DefaultDashboardKpiInner;
        },
        [props.KpiComponentProvider],
    );

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    let dashboardRender = (
        <DashboardStoreProvider
            backend={props.backend}
            workspace={props.workspace}
            dashboard={props.dashboard}
            filterContextRef={props.filterContextRef}
            eventHandlers={props.eventHandlers}
            config={props.config}
            permissions={props.permissions}
            onStateChange={props.onStateChange}
            onEventingInitialized={props.onEventingInitialized}
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
                            LayoutComponent={props.LayoutComponent ?? DefaultDashboardLayoutInner}
                            InsightComponentProvider={insightProvider}
                            InsightMenuButtonComponentProvider={insightMenuButtonProvider}
                            InsightMenuComponentProvider={insightMenuProvider}
                            KpiComponentProvider={kpiProvider}
                            WidgetComponentProvider={widgetProvider}
                            ButtonBarComponent={props.ButtonBarComponent ?? DefaultButtonBarInner}
                            MenuButtonComponent={props.MenuButtonComponent ?? DefaultMenuButtonInner}
                            TopBarComponent={props.TopBarComponent ?? DefaultTopBarInner}
                            TitleComponent={props.TitleComponent ?? DefaultTitleInner}
                            ScheduledEmailDialogComponent={
                                props.ScheduledEmailDialogComponent ?? DefaultScheduledEmailDialogInner
                            }
                            ShareDialogComponent={props.ShareDialogComponent ?? DefaultShareDialogInner}
                            SaveAsDialogComponent={props.SaveAsDialogComponent ?? DefaultSaveAsDialogInner}
                            DashboardAttributeFilterComponentProvider={attributeFilterProvider}
                            DashboardDateFilterComponent={
                                props.DashboardDateFilterComponent ?? DefaultDashboardDateFilterInner
                            }
                            FilterBarComponent={props.FilterBarComponent ?? DefaultFilterBarInner}
                        >
                            <DashboardConfigProvider menuButtonConfig={props.menuButtonConfig}>
                                <DashboardLoading {...props} />
                            </DashboardConfigProvider>
                        </DashboardComponentsProvider>
                    </DashboardCustomizationsProvider>
                </ExportDialogContextProvider>
            </ToastMessageContextProvider>
        </DashboardStoreProvider>
    );

    if (props.theme || !hasThemeProvider) {
        dashboardRender = (
            <ThemeProvider
                theme={props.theme}
                modifier={props.themeModifier ?? defaultDashboardThemeModifier}
            >
                {dashboardRender}
            </ThemeProvider>
        );
    }

    return dashboardRender;
};
