// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IdentifierRef, type UriRef, idRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";

import {
    type AttributeFilterComponentSet,
    type DashboardLayoutWidgetComponentSet,
    type DateFilterComponentSet,
    type InsightWidgetComponentSet,
    type RichTextWidgetComponentSet,
    type VisualizationSwitcherWidgetComponentSet,
} from "../../componentDefinition/types.js";
import {
    type AttributeFilterComponentProvider,
    type DashboardContentComponentProvider,
    type DashboardLayoutComponentProvider,
    type DateFilterComponentProvider,
    type FilterGroupComponentProvider,
    type InsightBodyComponentProvider,
    type InsightComponentProvider,
    type InsightMenuButtonComponentProvider,
    type InsightMenuComponentProvider,
    type InsightMenuTitleComponentProvider,
    type RichTextComponentProvider,
    type RichTextMenuComponentProvider,
    type RichTextMenuTitleComponentProvider,
    type ShowAsTableButtonComponentProvider,
    type VisualizationSwitcherComponentProvider,
    type VisualizationSwitcherToolbarComponentProvider,
    type WidgetComponentProvider,
} from "../../dashboardContexts/types.js";
import { DefaultDashboardAttributeFilter } from "../../filterBar/attributeFilter/DefaultDashboardAttributeFilter.js";
import { DefaultDashboardAttributeFilterComponentSetFactory } from "../../filterBar/attributeFilter/DefaultDashboardAttributeFilterComponentSetFactory.js";
import { DefaultDashboardDateFilter } from "../../filterBar/dateFilter/DefaultDashboardDateFilter.js";
import { DefaultDashboardDateFilterComponentSetFactory } from "../../filterBar/dateFilter/DefaultDashboardDateFilterComponentSetFactory.js";
import { DefaultDashboardFilterGroup } from "../../filterBar/filterBar/DefaultDashboardFilterGroup.js";
import { DefaultDashboardLayout as DefaultDashboardNestedLayout } from "../../widget/dashboardLayout/DefaultDashboardLayout.js";
import { DefaultDashboardLayoutComponentSetFactory } from "../../widget/dashboardLayout/DefaultDashboardLayoutComponentSetFactory.js";
import { DefaultDashboardInsight } from "../../widget/insight/DefaultDashboardInsight.js";
import { DefaultDashboardInsightComponentSetFactory } from "../../widget/insight/DefaultDashboardInsightComponentSetFactory.js";
import { DefaultInsightBody } from "../../widget/insight/DefaultInsightBody/DefaultInsightBody.js";
import { DefaultDashboardInsightMenu } from "../../widget/insightMenu/DefaultDashboardInsightMenu/DefaultDashboardInsightMenu.js";
import { DefaultDashboardInsightMenuButton } from "../../widget/insightMenu/DefaultDashboardInsightMenu/DefaultDashboardInsightMenuButton.js";
import { DefaultDashboardInsightMenuTitle } from "../../widget/insightMenu/DefaultDashboardInsightMenu/DefaultDashboardInsightMenuTitle.js";
import { DefaultDashboardRichText } from "../../widget/richText/DefaultDashboardRichText.js";
import { DefaultDashboardRichTextComponentSetFactory } from "../../widget/richText/DefaultDashboardRichTextComponentSetFactory.js";
import { DefaultDashboardRichTextMenu } from "../../widget/richTextMenu/DefaultDashboardRichTextMenu/DefaultDashboardRichTextMenu.js";
import { DefaultDashboardRichTextMenuTitle } from "../../widget/richTextMenu/DefaultDashboardRichTextMenu/DefaultDashboardRichTextMenuTitle.js";
import { DefaultShowAsTableButton } from "../../widget/showAsTableButton/DefaultShowAsTableButton/DefaultShowAsTableButton.js";
import { DefaultVisualizationSwitcherToolbar } from "../../widget/visualizationSwitcher/configuration/DefaultVisualizationSwitcherToolbar.js";
import { DefaultDashboardVisualizationSwitcher } from "../../widget/visualizationSwitcher/DefaultDashboardVisualizationSwitcher.js";
import { DefaultDashboardVisualizationSwitcherComponentSetFactory } from "../../widget/visualizationSwitcher/DefaultDashboardVisualizationSwitcherComponentSetFactory.js";
import { DefaultDashboardWidget } from "../../widget/widget/DefaultDashboardWidget.js";
import { DefaultDashboardMainContent } from "../DefaultDashboardContent/DefaultDashboardMainContent.js";
import { type IDashboardProps } from "../types.js";

interface IUseDashboardResult {
    backend: IAnalyticalBackend;
    workspace: string;
    dashboardOrRef: UriRef | IdentifierRef | undefined;
    hasThemeProvider: boolean;
    attributeFilterProvider: AttributeFilterComponentProvider;
    filterGroupProvider: FilterGroupComponentProvider;
    dateFilterProvider: DateFilterComponentProvider;
    widgetProvider: WidgetComponentProvider;
    insightProvider: InsightComponentProvider;
    insightBodyProvider: InsightBodyComponentProvider;
    insightMenuButtonProvider: InsightMenuButtonComponentProvider;
    insightMenuProvider: InsightMenuComponentProvider;
    richTextMenuProvider: RichTextMenuComponentProvider;
    insightMenuTitleProvider: InsightMenuTitleComponentProvider;
    richTextMenuTitleProvider: RichTextMenuTitleComponentProvider;
    dashboardContentProvider: DashboardContentComponentProvider;
    insightWidgetComponentSet: InsightWidgetComponentSet;
    attributeFilterComponentSet: AttributeFilterComponentSet;
    dateFilterComponentSet: DateFilterComponentSet;
    richTextProvider: RichTextComponentProvider;
    richTextWidgetComponentSet: RichTextWidgetComponentSet;
    visualizationSwitcherProvider: VisualizationSwitcherComponentProvider;
    visualizationSwitcherWidgetComponentSet: VisualizationSwitcherWidgetComponentSet;
    visualizationSwitcherToolbarComponentProvider: VisualizationSwitcherToolbarComponentProvider;
    dashboardLayoutProvider: DashboardLayoutComponentProvider;
    dashboardLayoutWidgetComponentSet: DashboardLayoutWidgetComponentSet;
    showAsTableButtonComponentProvider: ShowAsTableButtonComponentProvider;
}

export const useDashboard = (props: IDashboardProps): IUseDashboardResult => {
    const {
        dashboard,
        DashboardAttributeFilterComponentProvider,
        DashboardDateFilterComponentProvider,
        DashboardFilterGroupComponentProvider,
        WidgetComponentProvider,
        InsightComponentProvider,
        InsightBodyComponentProvider,
        InsightMenuButtonComponentProvider,
        InsightMenuComponentProvider,
        InsightMenuTitleComponentProvider,
        InsightComponentSetProvider,
        DashboardContentComponentProvider,
        RichTextComponentProvider,
        RichTextMenuComponentProvider,
        RichTextMenuTitleComponentProvider,
        VisualizationSwitcherComponentProvider,
        VisualizationSwitcherToolbarComponentProvider,
        DashboardLayoutComponentProvider,
        ShowAsTableButtonComponentProvider,
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

    const filterGroupProvider = useCallback<FilterGroupComponentProvider>(
        (filterGroup) => {
            const userSpecified = DashboardFilterGroupComponentProvider?.(filterGroup);
            return userSpecified ?? DefaultDashboardFilterGroup;
        },
        [DashboardFilterGroupComponentProvider],
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

    const visualizationSwitcherToolbarComponentProvider =
        useCallback<VisualizationSwitcherToolbarComponentProvider>(
            (widget) => {
                const userSpecified = VisualizationSwitcherToolbarComponentProvider?.(widget);
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

    const richTextMenuProvider = useCallback<RichTextMenuComponentProvider>(
        (richText) => {
            const userSpecified = RichTextMenuComponentProvider?.(richText);
            // if user customizes the items, always use the "new" default menu
            return userSpecified ?? DefaultDashboardRichTextMenu;
        },
        [RichTextMenuComponentProvider],
    );

    const richTextMenuTitleProvider = useCallback<RichTextMenuTitleComponentProvider>(
        (widget) => {
            const userSpecified = RichTextMenuTitleComponentProvider?.(widget);
            return userSpecified ?? DefaultDashboardRichTextMenuTitle;
        },
        [RichTextMenuTitleComponentProvider],
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

    const dashboardLayoutProvider = useCallback<DashboardLayoutComponentProvider>(
        (dashboardLayout) => {
            const userSpecified = DashboardLayoutComponentProvider?.(dashboardLayout);
            return userSpecified ?? DefaultDashboardNestedLayout;
        },
        [DashboardLayoutComponentProvider],
    );

    const dashboardLayoutWidgetComponentSet = useMemo<DashboardLayoutWidgetComponentSet>(() => {
        return DefaultDashboardLayoutComponentSetFactory(dashboardLayoutProvider);
    }, [dashboardLayoutProvider]);

    const showAsTableButtonComponentProvider = useCallback<ShowAsTableButtonComponentProvider>(
        (widget) => {
            const userSpecified = ShowAsTableButtonComponentProvider?.(widget);
            return userSpecified ?? DefaultShowAsTableButton;
        },
        [ShowAsTableButtonComponentProvider],
    );

    const isThemeLoading = useThemeIsLoading();
    const hasThemeProvider = isThemeLoading !== undefined;

    return {
        backend,
        workspace,
        hasThemeProvider,
        dashboardOrRef,
        attributeFilterProvider,
        dateFilterProvider,
        filterGroupProvider,
        widgetProvider,
        insightProvider,
        insightBodyProvider,
        insightMenuButtonProvider,
        insightMenuProvider,
        insightMenuTitleProvider,
        dashboardContentProvider,
        insightWidgetComponentSet,
        attributeFilterComponentSet,
        dateFilterComponentSet,
        richTextProvider,
        richTextMenuProvider,
        richTextMenuTitleProvider,
        richTextWidgetComponentSet,
        visualizationSwitcherProvider,
        visualizationSwitcherWidgetComponentSet,
        visualizationSwitcherToolbarComponentProvider,
        dashboardLayoutProvider,
        dashboardLayoutWidgetComponentSet,
        showAsTableButtonComponentProvider,
    };
};
