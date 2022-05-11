// (C) 2022 GoodData Corporation
import { useCallback, useMemo } from "react";
import {
    IDashboardAttributeFilter,
    IInsight,
    IInsightWidget,
    IKpi,
    IKpiWidget,
    idRef,
    IdentifierRef,
    UriRef,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { ExtendedDashboardWidget } from "../../../model";
import { CustomDashboardAttributeFilterComponent, DefaultDashboardAttributeFilter } from "../../filterBar";
import {
    CustomDashboardWidgetComponent,
    DefaultDashboardWidget,
    CustomDashboardInsightComponent,
    DefaultDashboardInsight,
    CustomDashboardInsightMenuButtonComponent,
    DefaultDashboardInsightMenuButton,
    LegacyDashboardInsightMenuButton,
    CustomDashboardInsightMenuComponent,
    DefaultDashboardInsightMenu,
    LegacyDashboardInsightMenu,
    CustomDashboardKpiComponent,
    DefaultDashboardKpi,
    CustomInsightRenderer,
    DefaultInsightRenderer,
} from "../../widget";
import { IDashboardProps } from "../types";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    AttributeFilterComponentProvider,
    WidgetComponentProvider,
    InsightComponentProvider,
    InsightMenuButtonComponentProvider,
    InsightMenuComponentProvider,
    KpiComponentProvider,
    InsightRendererProvider,
} from "../../dashboardContexts";

interface IUseDashboardResult {
    backend: IAnalyticalBackend;
    workspace: string;
    dashboardOrRef: UriRef | IdentifierRef | undefined;
    hasThemeProvider: boolean;
    attributeFilterProvider: AttributeFilterComponentProvider;
    widgetProvider: WidgetComponentProvider;
    insightProvider: InsightComponentProvider;
    insightRendererProvider: InsightRendererProvider;
    insightMenuButtonProvider: InsightMenuButtonComponentProvider;
    insightMenuProvider: InsightMenuComponentProvider;
    kpiProvider: KpiComponentProvider;
}

export const useDashboard = (props: IDashboardProps): IUseDashboardResult => {
    const {
        dashboard,
        DashboardAttributeFilterComponentProvider,
        WidgetComponentProvider,
        InsightComponentProvider,
        InsightRendererProvider,
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

    const insightRendererProvider = useCallback(
        (insight: IInsight, widget: IInsightWidget): CustomInsightRenderer => {
            const userSpecified = InsightRendererProvider?.(insight, widget);
            return userSpecified ?? DefaultInsightRenderer;
        },
        [InsightRendererProvider],
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
        (kpi: IKpi, widget: IKpiWidget): CustomDashboardKpiComponent => {
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
        insightRendererProvider,
        insightMenuButtonProvider,
        insightMenuProvider,
        kpiProvider,
    };
};
