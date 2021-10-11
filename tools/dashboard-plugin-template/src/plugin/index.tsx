// (C) 2021 GoodData Corporation
import { IDashboardPlugin } from "@gooddata/sdk-ui-dashboard";
import { Plugin } from "./Plugin";

/**
 * Wraps the plugin and reexports it as a default export. This makes its subsequent loading easier.
 * Do not change this file.
 */
const PluginFactory: () => IDashboardPlugin = () => {
    return new Plugin();
};

export default PluginFactory;
