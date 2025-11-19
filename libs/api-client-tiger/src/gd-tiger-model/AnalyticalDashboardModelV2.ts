// (C) 2020-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IFilterContext as IFilterContextModel,
    ObjRef,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export interface IDashboardDateFilterConfigItem {
    dateDataSet: ObjRef;
    config: IDashboardDateFilterConfig;
}

/**
 * Dashboard tab definition.
 *
 * @remarks
 * Each tab can have its own layout and its own filter context. Tabs are optional and
 * dashboards without tabs continue to work using the root layout and filter context.
 *
 * @alpha
 */
export interface IDashboardTab {
    /**
     * Unique identifier of the tab (stable within dashboard).
     */
    localIdentifier: string;

    /**
     * Display title of the tab.
     */
    title: string;

    /**
     * Complete layout definition for this tab.
     */
    layout: IDashboardLayout;

    /**
     * Tab-specific filter context.
     */
    filterContextRef: ObjRef;

    /**
     * Dashboard tab common date filter config
     */
    dateFilterConfig?: IDashboardDateFilterConfig;

    /**
     * Dashboard tab date filters with date data set/dimension configs
     */
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];

    /**
     * Dashboard extended attribute filter configs
     */
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

/**
 * @public
 */
export interface IAnalyticalDashboard {
    version: "2";
    layout?: IDashboardLayout;
    filterContextRef?: ObjRef;
    dateFilterConfig?: IDashboardDateFilterConfig;
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    plugins?: IDashboardPluginLink[];
    disableCrossFiltering?: boolean;
    disableUserFilterReset?: boolean;
    disableUserFilterSave?: boolean;
    disableFilterViews?: boolean;
    evaluationFrequency?: string;
    sectionHeadersDateDataSet?: ObjRef;

    /**
     * Optional tabs configuration; when defined, the dashboard renders as a tabbed interface.
     * Each tab has its own layout, filter context and filter configs.
     *
     * @alpha
     */
    tabs?: IDashboardTab[];

    /**
     * Local identifier of the active tab for persistence purposes.
     *
     * @alpha
     */
    activeTabLocalIdentifier?: string;
}

/**
 * @public
 */
export interface IFilterContext {
    version: "2";
    filters: IFilterContextModel["filters"];
}

/**
 * @public
 */
export interface IDashboardPlugin {
    version: "2";
    url: string;
}

/**
 * @public
 */
export interface IDashboardPluginLink {
    version: "2";
    plugin: ObjRef;
    parameters?: string;
}

/**
 * @public
 */
export function isAnalyticalDashboard(dashboard: unknown): dashboard is IAnalyticalDashboard {
    return !isEmpty(dashboard) && (dashboard as IAnalyticalDashboard).version === "2";
}

/**
 * @public
 */
export function isFilterContext(filterContext: unknown): filterContext is IFilterContext {
    return !isEmpty(filterContext) && (filterContext as IFilterContext).version === "2";
}

/**
 * @public
 */
export function isDashboardPlugin(plugin: unknown): plugin is IDashboardPlugin {
    return !isEmpty(plugin) && (plugin as IDashboardPlugin).version === "2";
}

/**
 * @public
 */
export function isDashboardPluginLink(pluginLink: unknown): pluginLink is IDashboardPluginLink {
    return !isEmpty(pluginLink) && (pluginLink as IDashboardPluginLink).version === "2";
}

/**
 * @alpha
 */
export function isDashboardTab(tab: unknown): tab is IDashboardTab {
    return (
        !isEmpty(tab) &&
        typeof (tab as IDashboardTab).localIdentifier === "string" &&
        typeof (tab as IDashboardTab).title === "string" &&
        typeof (tab as IDashboardTab).layout === "object" &&
        typeof (tab as IDashboardTab).filterContextRef === "object"
    );
}
