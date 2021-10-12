// (C) 2021 GoodData Corporation

import { IDashboardPluginContract_V1 } from "../plugin";
import { pluginDebugStr } from "./pluginUtils";

function addPluginInfoToMessage(plugin: IDashboardPluginContract_V1 | undefined, message: string) {
    return plugin ? `${pluginDebugStr(plugin)}: ${message}` : message;
}

/**
 * Common logger to use for all events that occur during customization. The logger is responsible for adding
 * information about plugin whose registration code triggered those events.
 */
export class DashboardCustomizationLogger {
    private currentPlugin: IDashboardPluginContract_V1 | undefined;

    public setCurrentPlugin = (plugin: IDashboardPluginContract_V1 | undefined): void => {
        this.currentPlugin = plugin;
    };

    public log = (message: string, ...optionalParams: any[]): void => {
        // eslint-disable-next-line no-console
        console.log(addPluginInfoToMessage(this.currentPlugin, message), optionalParams);
    };
    public warn = (message: string, ...optionalParams: any[]): void => {
        // eslint-disable-next-line no-console
        console.warn(addPluginInfoToMessage(this.currentPlugin, message), optionalParams);
    };
    public error = (message: string, ...optionalParams: any[]): void => {
        // eslint-disable-next-line no-console
        console.error(addPluginInfoToMessage(this.currentPlugin, message), optionalParams);
    };
}
