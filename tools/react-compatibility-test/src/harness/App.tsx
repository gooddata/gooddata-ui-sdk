// (C) 2019-2025 GoodData Corporation

import { PluginLoaderWrapper } from "./PluginLoader.js";
import React from "react";

export const App = () => {
    return (

        <div>
            <h1>App is running in React {React.version}</h1>
            <PluginLoaderWrapper />
        </div>
    );
};
