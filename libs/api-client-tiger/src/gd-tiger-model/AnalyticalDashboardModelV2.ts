// (C) 2020-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import {
    ObjRef,
    IFilterContext as IFilterContextModel,
    IDashboardLayout,
    IDashboardDateFilterConfig,
    IDashboardAttributeFilterConfig,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export interface IAnalyticalDashboard {
    version: "2";
    layout?: IDashboardLayout;
    filterContextRef?: ObjRef;
    dateFilterConfig?: IDashboardDateFilterConfig;
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    plugins?: IDashboardPluginLink[];
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
