// (C) 2021 GoodData Corporation
import { IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import { Plugin } from "./Plugin.js";

/**
 * Wraps the plugin and reexports it as a default export. This makes its subsequent loading easier.
 * Do not change this file.
 */
const PluginFactory: () => IDashboardPluginContract_V1 = () => {
    return new Plugin();
};

export default PluginFactory;
