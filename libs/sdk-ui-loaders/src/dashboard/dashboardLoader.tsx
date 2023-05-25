// (C) 2021-2023 GoodData Corporation

import { DashboardLoadResult, IDashboardLoader } from "./loader.js";
import {
    DashboardContext,
    IDashboardEngine,
    IDashboardExtensionProps,
    IDashboardPluginContract_V1,
    IDashboardProps,
} from "@gooddata/sdk-ui-dashboard";
import { IAnalyticalBackend, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import {
    IClientWorkspaceIdentifiers,
    ResolvedClientWorkspaceProvider,
    resolveLCMWorkspaceIdentifiers,
} from "@gooddata/sdk-ui";
import { idRef, isDashboard, ObjRef } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import isEmpty from "lodash/isEmpty.js";
import React from "react";
import {
    noopDashboardPluginLoader,
    staticDashboardEngineLoader,
} from "./loadingStrategies/staticComponentLoaders.js";
import {
    AdaptiveLoadOptions,
    BeforePluginsLoadedCallback,
    IBeforePluginsLoadedParams,
    IDashboardBasePropsForLoader,
    IDashboardLoadOptions,
    IDashboardPluginsLoaderOptions,
    LoadedPlugin,
    ModuleFederationIntegration,
    IEmbeddedPlugin,
} from "./types.js";
import {
    adaptiveDashboardBeforeLoadFactory,
    adaptiveDashboardEngineLoaderFactory,
    adaptiveDashboardPluginLoaderFactory,
} from "./loadingStrategies/adaptiveComponentLoaders.js";
import { validatePluginsBeforeLoading } from "./beforeLoadPluginValidation.js";
import { isPluginCompatibleWithDashboardEngine } from "./loadingStrategies/determineDashboardEngine.js";

/**
 * @public
 */
export type DashboardEngineLoader = (
    dashboard: IDashboardWithReferences | undefined,
) => Promise<IDashboardEngine>;

/**
 * @public
 */
export type DashboardPluginsLoader = (
    ctx: DashboardContext,
    dashboard: IDashboardWithReferences | undefined,
    options?: IDashboardPluginsLoaderOptions,
) => Promise<LoadedPlugin[]>;

/**
 * @public
 */
export type DashboardBeforeLoad = (
    ctx: DashboardContext,
    dashboard: IDashboardWithReferences | undefined,
) => Promise<void>;

/**
 * @public
 */
export type DashboardLoaderConfig = {
    /**
     * Specify function that will be used to load an instance of {@link @gooddata/sdk-ui-dashboard#DashboardEngine} to
     * use for rendering dashboard.
     */
    engineLoader: DashboardEngineLoader;

    /**
     * Specify function that will be used to load instances of plugins to integrate with the dashboard engine.
     */
    pluginLoader: DashboardPluginsLoader;

    /**
     * Specify a function that will be called before engineLoader and pluginLoader.
     *
     * @remarks
     * This function is useful if there are some steps needed for both engine and plugin loading.
     */
    beforeLoad?: DashboardBeforeLoad;
};

const StaticLoadStrategies: DashboardLoaderConfig = {
    engineLoader: staticDashboardEngineLoader,
    pluginLoader: noopDashboardPluginLoader,
};

const AdaptiveLoadStrategies = (
    moduleFederationIntegration: ModuleFederationIntegration,
): DashboardLoaderConfig => {
    return {
        engineLoader: adaptiveDashboardEngineLoaderFactory(moduleFederationIntegration),
        pluginLoader: adaptiveDashboardPluginLoaderFactory(moduleFederationIntegration),
        beforeLoad: adaptiveDashboardBeforeLoadFactory(moduleFederationIntegration),
    };
};

/**
 * Default implementation of the {@link IDashboardLoader} interface.
 *
 * @remarks
 * This class implements all the necessary functionality related to either static or dynamic dashboard loading.
 *
 * Note: you typically do not have to use this class directly and instead use the `useDashboardLoader`
 * hook or the `DashboardStub` component.
 *
 * @public
 */
export class DashboardLoader implements IDashboardLoader {
    private readonly config: DashboardLoaderConfig;
    private baseProps: Partial<IDashboardBasePropsForLoader> = {};
    private embeddedPlugins: IEmbeddedPlugin[] = [];
    private clientWorkspace: IClientWorkspaceIdentifiers | undefined = undefined;

    private constructor(config: DashboardLoaderConfig) {
        this.config = config;
    }

    /**
     * Create loader that will never do any dynamic loading and linking.
     *
     * @remarks
     * The loader will expect that the dashboard engine is statically linked in the context.
     * Any plugins that require dynamic loading from remote locations will be ignored.
     * Only locally embedded plugins will be used.
     */
    public static staticOnly(): DashboardLoader {
        return new DashboardLoader(StaticLoadStrategies);
    }

    /**
     * Create loader that may dynamically load dashboard engine and plugins in case a Dashboard to load
     * is using them.
     *
     * @remarks
     * Otherwise it will fall back to the dashboard engine statically linked to the context
     * and will only use locally embedded plugins.
     *
     * @param options - options for the adaptive load
     */
    public static adaptive(options: AdaptiveLoadOptions): DashboardLoader {
        return new DashboardLoader(AdaptiveLoadStrategies(options.moduleFederationIntegration));
    }

    public onBackend = (backend: IAnalyticalBackend): this => {
        this.baseProps.backend = backend;

        return this;
    };

    public fromClientWorkspace = (clientWorkspace: IClientWorkspaceIdentifiers): this => {
        this.clientWorkspace = clientWorkspace;
        this.baseProps.workspace = undefined;

        return this;
    };

    public fromWorkspace = (workspace: string): this => {
        this.baseProps.workspace = workspace;
        this.clientWorkspace = undefined;

        return this;
    };

    public forDashboard = (dashboardRef: ObjRef): this => {
        this.baseProps.dashboard = dashboardRef;

        return this;
    };

    public withFilterContext = (filterContextRef: ObjRef): this => {
        this.baseProps.filterContextRef = filterContextRef;

        return this;
    };

    public withEmbeddedPlugins = (...plugins: IEmbeddedPlugin[]): this => {
        this.embeddedPlugins = plugins ?? [];

        return this;
    };

    public withBaseProps = (props: IDashboardBasePropsForLoader): this => {
        this.baseProps = { ...props };

        return this;
    };

    private resolveWorkspace = async (
        backend: IAnalyticalBackend,
    ): Promise<[string | undefined, IClientWorkspaceIdentifiers | undefined]> => {
        if (!this.clientWorkspace) {
            return [this.baseProps.workspace, undefined];
        }

        const resolvedClientWorkspace = await resolveLCMWorkspaceIdentifiers(backend, this.clientWorkspace);
        invariant(
            !isEmpty(resolvedClientWorkspace),
            "DashboardLoader was not able to resolve LCM client workspace to actual workspace.",
        );

        return [resolvedClientWorkspace.workspace, resolvedClientWorkspace];
    };

    private loadParts = async (
        ctx: DashboardContext,
        dashboardWithPlugins: IDashboardWithReferences | undefined,
        config: DashboardLoaderConfig = this.config,
        beforeExternalPluginLoaded: BeforePluginsLoadedCallback,
    ): Promise<[IDashboardEngine, IDashboardPluginContract_V1[]]> => {
        const { engineLoader, pluginLoader, beforeLoad } = config;

        // eslint-disable-next-line no-console
        console.debug("Loading engine and plugins...");

        if (beforeLoad) {
            await beforeLoad(ctx, dashboardWithPlugins);
        }

        const [engine, plugins] = await Promise.all([
            engineLoader(dashboardWithPlugins),
            pluginLoader(ctx, dashboardWithPlugins, { beforePluginsLoaded: beforeExternalPluginLoaded }),
        ]);

        // eslint-disable-next-line no-console
        console.debug("Initializing the plugins...");

        const additionalPlugins = await initializeEmbeddedPlugins(ctx, this.embeddedPlugins);
        const loadedPlugins = await initializeLoadedPlugins(ctx, plugins);

        // If some of the plugins do not match the engine version, do not use any at all.
        const areLoadedPluginsCompatibleWithDashboardEngine = loadedPlugins.every((p) =>
            isPluginCompatibleWithDashboardEngine(engine, p),
        );

        if (!areLoadedPluginsCompatibleWithDashboardEngine) {
            console.error(
                "Some external dashboard plugin is incompatible with the loaded dashboard engine. " +
                    "None of the external plugins will be initialized.",
            );
        }

        const allPlugins = areLoadedPluginsCompatibleWithDashboardEngine
            ? [...loadedPlugins, ...additionalPlugins]
            : additionalPlugins;

        return [engine, allPlugins];
    };

    public load = async (options?: IDashboardLoadOptions): Promise<DashboardLoadResult> => {
        const { backend, dashboard, filterContextRef } = this.baseProps;
        const dashboardRef =
            typeof dashboard === "string"
                ? idRef(dashboard)
                : isDashboard(dashboard)
                ? dashboard.ref
                : dashboard;

        invariant(backend, "DashboardLoader is not configured with an instance of Analytical Backend.");

        const [workspace, clientWorkspace] = await this.resolveWorkspace(backend);
        invariant(workspace, "DashboardLoader is not configured with workspace to use and loader.");

        // eslint-disable-next-line no-console
        console.debug("Loading the dashboard...");

        const { config } = this.baseProps;
        let dashboardConfig = config;

        const dashboardWithPlugins =
            dashboardRef &&
            (await backend
                .workspace(workspace)
                .dashboards()
                .getDashboardWithReferences(
                    dashboardRef,
                    filterContextRef,
                    { loadUserData: true, exportId: config?.exportId },
                    ["dashboardPlugin"],
                ));

        const ctx: DashboardContext = {
            backend,
            config,
            workspace,
            dashboardRef,
            filterContextRef,
            dataProductId: clientWorkspace?.dataProduct,
            clientId: clientWorkspace?.client,
        };

        // eslint-disable-next-line no-console
        console.debug("Validating the plugins...");

        const pluginsAreValid =
            !dashboardWithPlugins || (await validatePluginsBeforeLoading(ctx, dashboardWithPlugins));
        if (!pluginsAreValid) {
            console.error(
                "Dashboard is configured with plugins that contain invalid URLs or " +
                    "are not located on allowed hosts. Loader is falling back to the " +
                    "statically linked dashboard without any external plugins.",
            );
        }
        let externalPluginLoaded = false;
        const beforeExternalPluginLoaded = (params: IBeforePluginsLoadedParams) => {
            if (params.externalPluginsCount > 0) {
                externalPluginLoaded = true;
            }
        };

        const [engine, plugins] = await this.loadParts(
            ctx,
            dashboardWithPlugins,
            !pluginsAreValid ? StaticLoadStrategies : this.config,
            beforeExternalPluginLoaded,
        );

        if (options?.allowUnfinishedFeatures === "staticOnly" && externalPluginLoaded) {
            dashboardConfig = {
                ...config,
                allowUnfinishedFeatures: false,
            };
        }

        const extensionProps: IDashboardExtensionProps = engine.initializePlugins(
            { ...ctx, config: dashboardConfig },
            plugins,
        );
        const props: IDashboardProps = {
            ...this.baseProps,
            config: dashboardConfig,
            ...extensionProps,
            workspace,
            dashboard: isDashboard(dashboard) ? dashboard : dashboardWithPlugins?.dashboard,
            // do not pass persisted dashboard if we did not pass a dashboard object to the dashboard prop
            // it would be redundant as they are equal
            persistedDashboard: isDashboard(dashboard) ? dashboardWithPlugins?.dashboard : undefined,
        };

        /*
         * if user specifies workspace using client workspace identifiers (data product & client), then the loader
         * must ensure that the actual dashboard component is rendered in the ClientWorkspace context. The dashboard
         * component is aware of this context and has some special logic in place for this occasion.
         */
        const DashboardComponent = !clientWorkspace
            ? engine.getDashboardComponent()
            : clientWorkspaceDashboardFactory(engine.getDashboardComponent(), clientWorkspace);

        return {
            ctx,
            engine,
            plugins,
            DashboardComponent,
            props,
        };
    };
}

function initializeEmbeddedPlugins(
    ctx: DashboardContext,
    embeddedPlugins: IEmbeddedPlugin[],
): Promise<IDashboardPluginContract_V1[]> {
    const plugins: LoadedPlugin[] = embeddedPlugins.map((embedded) => ({
        plugin: embedded.factory(),
        parameters: embedded.parameters,
    }));

    return initializeLoadedPlugins(ctx, plugins);
}

async function initializeLoadedPlugins(
    ctx: DashboardContext,
    plugins: LoadedPlugin[],
): Promise<IDashboardPluginContract_V1[]> {
    const validPlugins: IDashboardPluginContract_V1[] = [];

    for (const loadedPlugin of plugins) {
        const { plugin, parameters } = loadedPlugin;

        try {
            if (plugin.onPluginLoaded) {
                // eslint-disable-next-line no-console
                console.debug(`Calling onPluginLoaded on ${plugin.displayName}...`);
                const loadPromise = plugin.onPluginLoaded(ctx, parameters);

                await loadPromise;
            }
            validPlugins.push(plugin);
        } catch (e: any) {
            console.error(
                `The onPluginLoaded call for ${plugin.displayName} failed: ${e?.message}. Ignoring the plugin.`,
            );
        }
    }

    return validPlugins;
}

function clientWorkspaceDashboardFactory(
    Component: React.ComponentType<IDashboardProps>,
    clientWorkspace: IClientWorkspaceIdentifiers,
): React.FC<IDashboardProps> {
    function ClientWorkspaceDashboardWrapper(props: IDashboardProps) {
        return (
            <ResolvedClientWorkspaceProvider {...clientWorkspace}>
                <Component {...props} />
            </ResolvedClientWorkspaceProvider>
        );
    }

    return ClientWorkspaceDashboardWrapper;
}
