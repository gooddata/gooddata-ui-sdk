// (C) 2021 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";

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
}
