// (C) 2022 GoodData Corporation
import { useCallback, useMemo } from "react";
import { idRef, IdentifierRef, UriRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { DefaultDashboardAttributeFilter } from "../../filterBar";
import {
    DefaultDashboardWidget,
    DefaultDashboardInsight,
    DefaultDashboardInsightMenuButton,
    LegacyDashboardInsightMenuButton,
    DefaultDashboardInsightMenu,
    LegacyDashboardInsightMenu,
    DefaultDashboardKpi,
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

    const attributeFilterProvider = useCallback<AttributeFilterComponentProvider>(
        (filter) => {
            const userSpecified = DashboardAttributeFilterComponentProvider?.(filter);
            return userSpecified ?? DefaultDashboardAttributeFilter;
        },
        [DashboardAttributeFilterComponentProvider],
    );

    const widgetProvider = useCallback<WidgetComponentProvider>(
        (widget) => {
            const userSpecified = WidgetComponentProvider?.(widget);
            return userSpecified ?? DefaultDashboardWidget;
        },
        [WidgetComponentProvider],
    );

    const insightProvider = useCallback<InsightComponentProvider>(
        (insight, widget) => {
            const userSpecified = InsightComponentProvider?.(insight, widget);
            return userSpecified ?? DefaultDashboardInsight;
        },
        [InsightComponentProvider],
    );

    const insightRendererProvider = useCallback<InsightRendererProvider>(
        (insight, widget) => {
            const userSpecified = InsightRendererProvider?.(insight, widget);
            return userSpecified ?? DefaultInsightRenderer;
        },
        [InsightRendererProvider],
    );

    const insightMenuButtonProvider = useCallback<InsightMenuButtonComponentProvider>(
        (insight, widget) => {
            const userSpecified = InsightMenuButtonComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu button
            const FallbackDashboardInsightMenuButtonInner = insightMenuItemsProvider
                ? DefaultDashboardInsightMenuButton
                : LegacyDashboardInsightMenuButton;
            return userSpecified ?? FallbackDashboardInsightMenuButtonInner;
        },
        [InsightMenuButtonComponentProvider],
    );

    const insightMenuProvider = useCallback<InsightMenuComponentProvider>(
        (insight, widget) => {
            const userSpecified = InsightMenuComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu
            const FallbackDashboardInsightMenuInner = insightMenuItemsProvider
                ? DefaultDashboardInsightMenu
                : LegacyDashboardInsightMenu;
            return userSpecified ?? FallbackDashboardInsightMenuInner;
        },
        [InsightMenuComponentProvider],
    );

    const kpiProvider = useCallback<KpiComponentProvider>(
        (kpi, widget) => {
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
