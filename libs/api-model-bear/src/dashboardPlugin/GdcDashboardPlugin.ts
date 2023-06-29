// (C) 2021 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";

/**
 * @public
 */
export interface IWrappedDashboardPlugin {
    dashboardPlugin: IDashboardPlugin;
}

/**
 * @public
 */
export interface IDashboardPlugin {
    content: IDashboardPluginContent;
    meta: IObjectMeta;
}

/**
 * @public
 */
export interface IDashboardPluginContent {
    url: string;
}

/**
 * @public
 */
export function isDashboardPlugin(obj: unknown): obj is IWrappedDashboardPlugin {
    return !isEmpty(obj) && (obj as IWrappedDashboardPlugin).dashboardPlugin !== undefined;
}
