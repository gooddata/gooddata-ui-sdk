// (C) 2019-2021 GoodData Corporation
import React from "react";
import { IPluginSpec } from "./types";
import { PluginLoader } from "./PluginLoader";

// make sure the @gooddata/sdk-ui-ext is used somewhere in the app so that it does not get tree-shaken away
// this ensures our version is used in the plugins as well
import * as EXT from "@gooddata/sdk-ui-ext";
// eslint-disable-next-line no-console
console.log(EXT.isDrillDownDefinition);

export const App: React.FC = () => {
    const plugin: IPluginSpec = {
        url: `http://localhost:${PORT}/plugin.js`,
        scope: SCOPE_NAME,
        module: "./plugin",
    };

    return (
        <div>
            <h1>Dashboard Plugin Host</h1>
            <div style={{ marginTop: "2em" }}>
                <PluginLoader plugin={plugin} />
            </div>
        </div>
    );
};
