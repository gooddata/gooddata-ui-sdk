// (C) 2021 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine, IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import { ModuleFederationIntegration } from "../types";

/**
 * @internal
 */
export async function dynamicDashboardEngineLoader(
    dashboard: IDashboardWithReferences,
    moduleFederationIntegration: ModuleFederationIntegration,
): Promise<IDashboardEngine> {
    const { plugins } = dashboard.references;
    if (!plugins.length) {
        return null as any; //TODO what to do here?
    }

    const first = plugins[0];

    const moduleName = /.*\/(.+)\.js/.exec(first.url)![1];

    const loadedEngineModule = await loadEngine(moduleName, moduleFederationIntegration)();

    const engineFactory = loadedEngineModule.default;
    return engineFactory();
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

    return Promise.all(
        urls.map(async (url) => {
            const moduleName = /.*\/(.+)\.js/.exec(url)![1];
            const loadedModule = await loadPlugin(moduleName, moduleFederationIntegration)();
            const pluginFactory = loadedModule.default;
            return pluginFactory();
        }),
    );
}

/**
 * @internal
 */
export async function dynamicDashboardCommonLoader(
    _ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
): Promise<void> {
    const { plugins } = dashboard.references;
    if (!plugins.length) {
        return;
    }

    const urls = plugins.map((plugin) => plugin.url);

    const tasks = urls.map(addScriptTag);
    // TODO how to unload/remove the script tags once not needed?
    // effectiveElements.current = tasks.map((task) => task.element);
    await Promise.all(tasks.map((task) => task.promise));
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

function loadEntry(
    moduleName: string,
    { __webpack_init_sharing__, __webpack_share_scopes__ }: ModuleFederationIntegration,
) {
    return async (): Promise<{ pluginKey: string; engineKey: string }> => {
        // Initializes the share scope. This fills it with known provided modules from this build and all remotes
        await __webpack_init_sharing__("default");

        const container = window[moduleName]; // or get the container somewhere else
        // Initialize the container, it may provide shared modules
        await container.init(__webpack_share_scopes__.default);
        // the `./${moduleName}` corresponds to exposes in the dashboard-plugin-template webpack config
        const entryFactory = await window[moduleName].get(`./${moduleName}_ENTRY`);

        return entryFactory().default;
    };
}

function loadPlugin(moduleName: string, moduleFederationIntegration: ModuleFederationIntegration) {
    return async () => {
        const entry = await loadEntry(moduleName, moduleFederationIntegration)();
        const factory = await window[moduleName].get(entry.pluginKey);

        return factory();
    };
}

function loadEngine(moduleName: string, moduleFederationIntegration: ModuleFederationIntegration) {
    return async () => {
        const entry = await loadEntry(moduleName, moduleFederationIntegration)();
        const factory = await window[moduleName].get(entry.engineKey);

        return factory();
    };
}
