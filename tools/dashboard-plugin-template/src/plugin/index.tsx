// (C) 2019-2021 GoodData Corporation
import React from "react";
import { Plugin } from "./Plugin";

/**
 * Wraps the plugin and reexports it as a default export. This makes its subsequent loading easier.
 * Do not change this file.
 */
const PluginWrapper: React.FC = () => {
    return <Plugin />;
};

export default PluginWrapper;
