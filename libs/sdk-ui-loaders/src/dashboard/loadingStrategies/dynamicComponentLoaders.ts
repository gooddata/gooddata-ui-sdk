// (C) 2021 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine } from "@gooddata/sdk-ui-dashboard";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { LoadedPlugin, ModuleFederationIntegration } from "../types";
import invariant from "ts-invariant";
import isEmpty from "lodash/isEmpty";

/**
 * @internal
 */
export async function dynamicDashboardEngineLoader(
    dashboard: IDashboardWithReferences,
    moduleFederationIntegration: ModuleFederationIntegration,
): Promise<IDashboardEngine> {
    const { plugins } = dashboard.references;
    // if this bombs, this loader was called with no plugins (which means noop version should have been used)
    invariant(!isEmpty(plugins));

    const first = plugins[0];

    const loadedEngineModule = await loadEngine(moduleNameFromUrl(first.url), moduleFederationIntegration)();

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
): Promise<LoadedPlugin[]> {
    const { plugins } = dashboard.references;
    if (!plugins.length) {
        return [];
    }

    const pluginLinks = dashboard.dashboard.plugins;

    return Promise.all(
        plugins.map(async (pluginMeta): Promise<LoadedPlugin> => {
            const loadedModule = await loadPlugin(
                moduleNameFromUrl(pluginMeta.url),
                moduleFederationIntegration,
            )();
            const pluginFactory = loadedModule.default;

            const plugin = pluginFactory();
            const pluginLink = pluginLinks?.find((link) => areObjRefsEqual(link.plugin, pluginMeta.ref));

            return {
                plugin,
                parameters: pluginLink?.parameters,
            };
        }),
    );
}

/**
 * @internal
 */
export async function dynamicDashboardBeforeLoad(
    _ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
): Promise<void> {
    const { plugins } = dashboard.references;
    if (!plugins.length) {
        return;
    }

    const urls = plugins.map((plugin) => plugin.url);

    const tasks = urls.map(addScriptTag);

    // add the script tags...
    await Promise.all(tasks.map((task) => task.promise));

    // ...and once they are added (and added to the global scope), remove them immediately, they are not needed anymore
    tasks.forEach(({ element }) => {
        document.head.removeChild(element);
    });
}

function moduleNameFromUrl(url: string): string {
    const moduleName = /.*\/(.+)\.js/.exec(url)?.[1];
    invariant(moduleName, "Invalid plugin URL provided, it must point to the root .js file");
    return moduleName;
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
        // the `./${moduleName}_ENTRY` corresponds to exposes in the dashboard-plugin-template webpack config
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
