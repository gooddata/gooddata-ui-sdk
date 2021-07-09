// (C) 2019-2021 GoodData Corporation
import React from "react";
import { IPluginSpec } from "./types";
import { useDynamicScript } from "./useDynamicScript";

function loadComponent(scope: string, module: any) {
    return async () => {
        // Initializes the share scope. This fills it with known provided modules from this build and all remotes
        await __webpack_init_sharing__("default");

        const container = window[scope]; // or get the container somewhere else
        // Initialize the container, it may provide shared modules
        await container.init(__webpack_share_scopes__.default);
        const factory = await window[scope].get(module);
        return factory();
    };
}

export interface IPluginLoaderProps {
    plugin: IPluginSpec;
}

export const PluginLoader: React.FC<IPluginLoaderProps> = (props: { plugin: IPluginSpec }) => {
    const { ready, failed } = useDynamicScript({
        url: props.plugin?.url,
    });

    if (!props.plugin) {
        return <h2>No plugin selected</h2>;
    }

    if (!ready) {
        return <h2>Loading plugin: {props.plugin.url}</h2>;
    }

    if (failed) {
        return <h2>Failed to load plugin: {props.plugin.url}</h2>;
    }

    const Component = React.lazy(loadComponent(props.plugin.scope, props.plugin.module));

    return (
        <React.Suspense fallback="Loading Plugin">
            <Component />
        </React.Suspense>
    );
};
