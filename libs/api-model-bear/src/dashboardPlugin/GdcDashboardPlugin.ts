// (C) 2021 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export namespace GdcDashboardPlugin {
    export interface IWrappedDashboardPlugin {
        dashboardPlugin: IDashboardPlugin;
    }

    export interface IDashboardPlugin {
        content: IDashboardPluginContent;
        meta: GdcMetadata.IObjectMeta;
    }

    export interface IDashboardPluginContent {
        url: string;
    }

    export function isDashboardPlugin(obj: unknown): obj is IWrappedDashboardPlugin {
        return !isEmpty(obj) && (obj as IWrappedDashboardPlugin).dashboardPlugin !== undefined;
    }
}
