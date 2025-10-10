// (C) 2019-2025 GoodData Corporation

import { useCallback, useState, useEffect } from "react";

import { idRef } from "@gooddata/sdk-model";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";
import { DashboardConfig } from "@gooddata/sdk-ui-dashboard";
import { IEmbeddedPlugin, useDashboardLoaderWithPluginManipulation } from "@gooddata/sdk-ui-loaders";


function addScriptTag(url: string): { element: HTMLScriptElement; promise: Promise<void> } {
    const element = document.createElement("script");

    const promise = new Promise<void>((resolve, reject) => {
        element.src = url;
        element.type = "text/javascript";
        element.async = true;
        if (url.match(/.mjs$/)) {
            element.type = "module";
        }

        element.onload = () => {
            // eslint-disable-next-line no-console
            console.log(`Dynamic Script Loaded: ${url}`);
            resolve();
        };

        element.onerror = () => {
            const message = `Dynamic Script Error: ${url}`;
            console.error(message);
            reject(new Error(message));
        };

        document.head.appendChild(element);
    });

    return {
        promise,
        element,
    };
}

function loadEntry(
    moduleName: string,
    __webpack_init_sharing__: any,
    __webpack_share_scopes__: any,
) {
    return async () => {
        // Initializes the share scope. This fills it with known provided modules from this build and all remotes
        await __webpack_init_sharing__("default");

        const container = (window as any)[moduleName]; // or get the container somewhere else
        // Initialize the container, it may provide shared modules
        await container.init(__webpack_share_scopes__.default);
        // the `./${moduleName}_ENTRY` corresponds to exposes in the dashboard-plugin-template webpack config
        const entryFactory = await (window as any)[moduleName].get(`./${moduleName}_ENTRY`);

        return entryFactory().default;
    };
}

// Custom hook for dynamic plugin loading using Module Federation
const useDynamicPlugins = () => {
    const [plugins, setPlugins] = useState<IEmbeddedPlugin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadPlugins = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Dynamically import the plugin using Module Federation
                const moduleName = PLUGIN_NAME;
                const scriptTag = addScriptTag(`https://localhost:8000/plugin/${moduleName}.mjs`);
                await scriptTag.promise;

                const entry = await loadEntry(moduleName, __webpack_init_sharing__, __webpack_share_scopes__)();


                const pluginFactory = await (window as any)[moduleName].get(entry.pluginKey);
                const plugin = pluginFactory();
                const resultingFactory = plugin.default;

                if(PLUGIN_PARAMETERS) {
                    setPlugins([{ factory: resultingFactory , parameters: JSON.stringify(PLUGIN_PARAMETERS) }]);
                } else {
                    setPlugins([{ factory: resultingFactory }]);
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error("Failed to load plugin");
                setError(error);
                console.error("Plugin loading failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPlugins();
    }, []);

    return { plugins, isLoading, error };
};

// Fallback for when plugins fail to load
const Config: DashboardConfig = {
    mapboxToken: process.env.MAPBOX_TOKEN,
    agGridToken: process.env.AG_GRID_TOKEN,
};
const DashboardRef = idRef(process.env.DASHBOARD_ID!, "analyticalDashboard");

export const PluginLoaderWrapper = (props: any) => {
    const { plugins: dynamicPlugins, isLoading: pluginsLoading, error: pluginError } = useDynamicPlugins();

    if (pluginsLoading) {
        return <LoadingComponent />;
    }
    if (pluginError) {
        return <ErrorComponent message={pluginError.message} />;
    }
    return <PluginLoader {...props} plugz={dynamicPlugins} />;
}

export const PluginLoader = (props: any) => {

    const { loaderStatus, reloadPlugins, setExtraPlugins, extraPlugins, hidePluginOverlays } =
        useDashboardLoaderWithPluginManipulation({
            dashboard: DashboardRef,
            loadingMode: "staticOnly",
            config: Config,
            extraPlugins: (props as any).plugz,
        });

    const isPluginEnabled = !!extraPlugins?.length;
    const [isHideOverlaysEnabled, setIsHideOverlaysEnabled] = useState(true);
    const hidePluginsOverlaysCallbacks = useCallback(() => {
        if (isHideOverlaysEnabled) {
            setIsHideOverlaysEnabled(false);
            hidePluginOverlays();
        }
    }, [isPluginEnabled, setExtraPlugins]);

    const { status, error, result } = loaderStatus;

    if (status === "error" || result === undefined) {
        return <ErrorComponent message={error?.message ?? ""} />;
    }

    return <result.DashboardComponent {...result.props} />;
};
