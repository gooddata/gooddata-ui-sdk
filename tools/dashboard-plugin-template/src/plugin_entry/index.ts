// (C) 2021 GoodData Corporation
import type { DashboardPluginDescriptor } from "@gooddata/sdk-ui-dashboard";

import { MODULE_FEDERATION_NAME } from "../metadata.json";

import packageJson from "../../package.json";

type PluginEntryPoint = DashboardPluginDescriptor & {
    /**
     * Key to the module federation container where to find the engine bundle entry point.
     */
    engineKey: string;
    /**
     * Key to the module federation container where to find the plugin bundle entry point.
     */
    pluginKey: string;
};

const entryPoint: PluginEntryPoint = {
    author: packageJson.author,
    displayName: packageJson.name,
    version: packageJson.version,
    minEngineVersion: "bundled",
    maxEngineVersion: "bundled",
    // These two must fit the values in the webpack config. Do not edit them unless you know what you are doing
    engineKey: `./${MODULE_FEDERATION_NAME}_ENGINE`,
    pluginKey: `./${MODULE_FEDERATION_NAME}_PLUGIN`,
};

export default entryPoint;
