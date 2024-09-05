// (C) 2022-2024 GoodData Corporation
import { useCallback, useMemo } from "react";
import { idRef, IdentifierRef, UriRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import {
    DefaultDashboardAttributeFilter,
    DefaultDashboardDateFilter,
    DefaultDashboardAttributeFilterComponentSetFactory,
    DefaultDashboardDateFilterComponentSetFactory,
} from "../../filterBar/index.js";
import {
    DefaultDashboardWidget,
    DefaultDashboardInsightMenuButton,
    DefaultDashboardInsightMenu,
    DefaultInsightBody,
    DefaultDashboardInsight,
    DefaultDashboardKpi,
    DefaultDashboardInsightComponentSetFactory,
    DefaultDashboardKpiComponentSetFactory,
    DefaultDashboardInsightMenuTitle,
    DefaultDashboardRichText,
    DefaultDashboardRichTextComponentSetFactory,
    DefaultDashboardVisualizationSwitcher,
    DefaultDashboardVisualizationSwitcherComponentSetFactory,
    DefaultVisualizationSwitcherToolbar,
} from "../../widget/index.js";
import { IDashboardProps } from "../types.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    AttributeFilterComponentProvider,
    WidgetComponentProvider,
    InsightComponentProvider,
    InsightBodyComponentProvider,
    InsightMenuButtonComponentProvider,
    InsightMenuComponentProvider,
    KpiComponentProvider,
    DateFilterComponentProvider,
    InsightMenuTitleComponentProvider,
    DashboardContentComponentProvider,
    RichTextComponentProvider,
    VisualizationSwitcherComponentProvider,
    VisualizationSwitcherToolbarComponentProvider,
} from "../../dashboardContexts/index.js";
import {
    AttributeFilterComponentSet,
    DateFilterComponentSet,
    InsightWidgetComponentSet,
    KpiWidgetComponentSet,
    RichTextWidgetComponentSet,
    VisualizationSwitcherWidgetComponentSet,
} from "../../componentDefinition/index.js";
import { DefaultDashboardMainContent } from "../DefaultDashboardContent/DefaultDashboardMainContent.js";

interface IUseDashboardResult {
    backend: IAnalyticalBackend;
    workspace: string;
    dashboardOrRef: UriRef | IdentifierRef | undefined;
    hasThemeProvider: boolean;
    attributeFilterProvider: AttributeFilterComponentProvider;
    dateFilterProvider: DateFilterComponentProvider;
    widgetProvider: WidgetComponentProvider;
    insightProvider: InsightComponentProvider;
    insightBodyProvider: InsightBodyComponentProvider;
    insightMenuButtonProvider: InsightMenuButtonComponentProvider;
    insightMenuProvider: InsightMenuComponentProvider;
    insightMenuTitleProvider: InsightMenuTitleComponentProvider;
    kpiProvider: KpiComponentProvider;
    dashboardContentProvider: DashboardContentComponentProvider;
    insightWidgetComponentSet: InsightWidgetComponentSet;
    kpiWidgetComponentSet: KpiWidgetComponentSet;
    attributeFilterComponentSet: AttributeFilterComponentSet;
    dateFilterComponentSet: DateFilterComponentSet;
    richTextProvider: RichTextComponentProvider;
    richTextWidgetComponentSet: RichTextWidgetComponentSet;
    visualizationSwitcherProvider: VisualizationSwitcherComponentProvider;
    visualizationSwitcherWidgetComponentSet: VisualizationSwitcherWidgetComponentSet;
    visualizationSwitcherToolbarComponentProvider: VisualizationSwitcherToolbarComponentProvider;
}

export const useDashboard = (props: IDashboardProps): IUseDashboardResult => {
    const {
        dashboard,
        DashboardAttributeFilterComponentProvider,
        DashboardDateFilterComponentProvider,
        WidgetComponentProvider,
        InsightComponentProvider,
        InsightBodyComponentProvider,
        InsightMenuButtonComponentProvider,
        InsightMenuComponentProvider,
        InsightMenuTitleComponentProvider,
        InsightComponentSetProvider,
        KpiComponentProvider,
        DashboardContentComponentProvider,
        RichTextComponentProvider,
        VisualizationSwitcherComponentProvider,
        VisualizationSwitcherToolbarComponentProvider,
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

    const dashboardContentProvider = useCallback<DashboardContentComponentProvider>(
        (dashboard) => {
            const userSpecified = DashboardContentComponentProvider?.(dashboard);
            return userSpecified ?? DefaultDashboardMainContent;
        },
        [DashboardContentComponentProvider],
    );

    const dateFilterProvider = useCallback<DateFilterComponentProvider>(
        (filter) => {
            const userSpecified = DashboardDateFilterComponentProvider?.(filter);
            return userSpecified ?? DefaultDashboardDateFilter;
        },
        [DashboardDateFilterComponentProvider],
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

    const insightBodyProvider = useCallback<InsightBodyComponentProvider>(
        (insight, widget) => {
            const userSpecified = InsightBodyComponentProvider?.(insight, widget);
            return userSpecified ?? DefaultInsightBody;
        },
        [InsightBodyComponentProvider],
    );

    const insightMenuButtonProvider = useCallback<InsightMenuButtonComponentProvider>(
        (insight, widget) => {
            const userSpecified = InsightMenuButtonComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu button
            return userSpecified ?? DefaultDashboardInsightMenuButton;
        },
        [InsightMenuButtonComponentProvider],
    );

    const insightMenuProvider = useCallback<InsightMenuComponentProvider>(
        (insight, widget) => {
            const userSpecified = InsightMenuComponentProvider?.(insight, widget);
            // if user customizes the items, always use the "new" default menu
            return userSpecified ?? DefaultDashboardInsightMenu;
        },
        [InsightMenuComponentProvider],
    );

    const insightMenuTitleProvider = useCallback<InsightMenuTitleComponentProvider>(
        (insight, widget) => {
            const userSpecified = InsightMenuTitleComponentProvider?.(insight, widget);
            return userSpecified ?? DefaultDashboardInsightMenuTitle;
        },
        [InsightMenuTitleComponentProvider],
    );

    const kpiProvider = useCallback<KpiComponentProvider>(
        (kpi, widget) => {
            const userSpecified = KpiComponentProvider?.(kpi, widget);
            return userSpecified ?? DefaultDashboardKpi;
        },
        [KpiComponentProvider],
    );

    const visualizationSwitcherToolbarComponentProvider =
        useCallback<VisualizationSwitcherToolbarComponentProvider>(
            (widget) => {
                const userSpecified = VisualizationSwitcherToolbarComponentProvider?.(widget);
                // if user customizes the items, always use the "new" default menu
                return userSpecified ?? DefaultVisualizationSwitcherToolbar;
            },
            [VisualizationSwitcherToolbarComponentProvider],
        );

    const dashboardOrRef = useMemo(() => {
        return typeof dashboard === "string" ? idRef(dashboard) : dashboard;
    }, [dashboard]);

    const insightWidgetComponentSet = useMemo<InsightWidgetComponentSet>(() => {
        const defaultComponentSet = DefaultDashboardInsightComponentSetFactory(insightProvider);
        return InsightComponentSetProvider
            ? InsightComponentSetProvider(defaultComponentSet)
            : defaultComponentSet;
    }, [InsightComponentSetProvider, insightProvider]);

    const kpiWidgetComponentSet = useMemo<KpiWidgetComponentSet>(() => {
        return DefaultDashboardKpiComponentSetFactory(kpiProvider);
    }, [kpiProvider]);

    const attributeFilterComponentSet = useMemo<AttributeFilterComponentSet>(() => {
        return DefaultDashboardAttributeFilterComponentSetFactory(attributeFilterProvider);
    }, [attributeFilterProvider]);

    const dateFilterComponentSet = useMemo<DateFilterComponentSet>(() => {
        return DefaultDashboardDateFilterComponentSetFactory(dateFilterProvider);
    }, [dateFilterProvider]);

    const richTextProvider = useCallback<RichTextComponentProvider>(
        (richText) => {
            const userSpecified = RichTextComponentProvider?.(richText);
            return userSpecified ?? DefaultDashboardRichText;
        },
        [RichTextComponentProvider],
    );

    const richTextWidgetComponentSet = useMemo<RichTextWidgetComponentSet>(() => {
        return DefaultDashboardRichTextComponentSetFactory(richTextProvider);
    }, [richTextProvider]);

    const visualizationSwitcherProvider = useCallback<VisualizationSwitcherComponentProvider>(
        (visualizationSwitcher) => {
            const userSpecified = VisualizationSwitcherComponentProvider?.(visualizationSwitcher);
            return userSpecified ?? DefaultDashboardVisualizationSwitcher;
        },
        [VisualizationSwitcherComponentProvider],
    );

    const visualizationSwitcherWidgetComponentSet = useMemo<VisualizationSwitcherWidgetComponentSet>(() => {
        return DefaultDashboardVisualizationSwitcherComponentSetFactory(visualizationSwitcherProvider);
    }, [visualizationSwitcherProvider]);

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    return {
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
        dashboardContentProvider,
        insightWidgetComponentSet,
        kpiWidgetComponentSet,
        attributeFilterComponentSet,
        dateFilterComponentSet,
        richTextProvider,
        richTextWidgetComponentSet,
        visualizationSwitcherProvider,
        visualizationSwitcherWidgetComponentSet,
        visualizationSwitcherToolbarComponentProvider,
    };
};
