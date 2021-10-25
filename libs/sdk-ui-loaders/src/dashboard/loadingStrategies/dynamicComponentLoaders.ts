// (C) 2021 GoodData Corporation
import { IDashboardWithReferences, NotImplemented } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine, IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import { ModuleFederationIntegration } from "../types";

/**
 * @internal
 */
export function dynamicDashboardEngineLoader(
    _dashboard: IDashboardWithReferences,
): Promise<IDashboardEngine> {
    return Promise.reject(new NotImplemented(""));
}

/**
 * @internal
 */
export async function dynamicDashboardPluginLoader(
    _ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
    moduleFederationIntegration: ModuleFederationIntegration,
): Promise<IDashboardPluginContract_V1[]> {
    const { plugins } = dashboard.references;
    if (!plugins.length) {
        return [];
    }

    const urls = plugins.map((plugin) => plugin.url);

    const tasks = urls.map(addScriptTag);
    // effectiveElements.current = tasks.map((task) => task.element);
    await Promise.all(tasks.map((task) => task.promise));

    return Promise.all(
        urls.map(async (url) => {
            const moduleName = /.*\/(.+)\.js/.exec(url)![1];
            const loadedModule = await loadComponent(moduleName, moduleFederationIntegration)();
            const pluginFactory = loadedModule.default;
            return pluginFactory();
        }),
    );
}

function addScriptTag(url: string): { element: HTMLScriptElement; promise: Promise<void> } {
    const element = document.createElement("script");

    const promise = new Promise<void>((resolve, reject) => {
        element.src = url;
        element.type = "text/javascript";
        element.async = true;

        element.onload = () => {
            // eslint-disable-next-line no-console
            console.log(`Dynamic Script Loaded: ${url}`);
            resolve();
        };

        element.onerror = () => {
            // eslint-disable-next-line no-console
            console.error(`Dynamic Script Error: ${url}`);
            reject();
        };

        document.head.appendChild(element);
    });

    return {
        promise,
        element,
    };
}

function loadComponent(
    moduleName: string,
    { __webpack_init_sharing__, __webpack_share_scopes__ }: ModuleFederationIntegration,
) {
    return async () => {
        // Initializes the share scope. This fills it with known provided modules from this build and all remotes
        await __webpack_init_sharing__("default");

        const container = window[moduleName]; // or get the container somewhere else
        // Initialize the container, it may provide shared modules
        await container.init(__webpack_share_scopes__.default);
        // the `./${moduleName}` corresponds to exposes in the dashboard-plugin-template webpack config
        const factory = await window[moduleName].get(`./${moduleName}`);

        return factory();
    };
}
