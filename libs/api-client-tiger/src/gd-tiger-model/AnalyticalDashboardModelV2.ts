// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type ObjRef } from "@gooddata/sdk-model";

import {
    type ITigerDashboardAttributeFilterConfig,
    type ITigerDashboardDateFilterConfig,
    type ITigerDashboardLayout,
    type ITigerDashboardTab,
    type ITigerFilterContextItem,
} from "./TigerTypes.js";

/**
 * @public
 */
export interface IDashboardDateFilterConfigItem {
    dateDataSet: ObjRef;
    config: ITigerDashboardDateFilterConfig;
}

/**
 * Dashboard tab definition.
 *
 * @remarks
 * This is an alias for ITigerDashboardTab for backward compatibility.
 *
 * @public
 */
export type IDashboardTab = ITigerDashboardTab;

/**
 * @public
 */
export interface IAnalyticalDashboard {
    version: "2";
    layout?: ITigerDashboardLayout;
    filterContextRef?: ObjRef;
    dateFilterConfig?: ITigerDashboardDateFilterConfig;
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    attributeFilterConfigs?: ITigerDashboardAttributeFilterConfig[];
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
    tabs?: ITigerDashboardTab[];
}

/**
 * @public
 */
export interface IFilterContext {
    version: "2";
    filters: ITigerFilterContextItem[];
}

/**
 * @alpha
 */
export interface IFilterContextWithTab extends IFilterContext {
    tabLocalIdentifier?: string;
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
 * @alpha
 */
export function isFilterContextWithTab(filterContext: unknown): filterContext is IFilterContextWithTab {
    return (
        (!isEmpty(filterContext) &&
            (filterContext as IFilterContextWithTab).version === "2" &&
            typeof (filterContext as IFilterContextWithTab).tabLocalIdentifier === "string") ||
        (filterContext as IFilterContextWithTab).tabLocalIdentifier === undefined
    );
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
export function isDashboardTab(tab: unknown): tab is ITigerDashboardTab {
    return (
        !isEmpty(tab) &&
        typeof (tab as ITigerDashboardTab).localIdentifier === "string" &&
        typeof (tab as ITigerDashboardTab).title === "string" &&
        typeof (tab as ITigerDashboardTab).layout === "object" &&
        typeof (tab as ITigerDashboardTab).filterContextRef === "object"
    );
}
