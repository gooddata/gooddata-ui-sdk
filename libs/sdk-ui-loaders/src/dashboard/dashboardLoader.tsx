// (C) 2021 GoodData Corporation

import { DashboardLoadResult, IDashboardLoader, IEmbeddedPlugin } from "./loader";
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
import { ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import isEmpty from "lodash/isEmpty";
import React from "react";
import {
    noopDashboardPluginLoader,
    staticDashboardEngineLoader,
} from "./loadingStrategies/staticComponentLoaders";
import { AdaptiveLoadOptions, IDashboardBasePropsForLoader, ModuleFederationIntegration } from "./types";
import {
    adaptiveDashboardBeforeLoadFactory,
    adaptiveDashboardEngineLoaderFactory,
    adaptiveDashboardPluginLoaderFactory,
} from "./loadingStrategies/adaptiveComponentLoaders";
import { validatePluginsBeforeLoading } from "./beforeLoadPluginValidation";

/**
 * @alpha
 */
export type DashboardEngineLoader = (dashboard: IDashboardWithReferences) => Promise<IDashboardEngine>;

/**
 * @alpha
 */
export type DashboardPluginsLoader = (
    ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
) => Promise<IDashboardPluginContract_V1[]>;

/**
 * @alpha
 */
export type DashboardBeforeLoad = (
    ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
) => Promise<void>;

/**
 * @alpha
 */
export type DashboardEngineLoaderFactory = (
    moduleFederationIntegration: ModuleFederationIntegration,
) => DashboardEngineLoader;

/**
 * @alpha
 */
export type DashboardPluginsLoaderFactory = (
    moduleFederationIntegration: ModuleFederationIntegration,
) => DashboardPluginsLoader;

/**
 * @alpha
 */
export type DashboardBeforeLoadFactory = (
    moduleFederationIntegration: ModuleFederationIntegration,
) => DashboardBeforeLoad;

/**
 * @alpha
 */
export type DashboardLoaderConfig = {
    /**
     * Specify factory for a function that will be used to load an instance of {@link @gooddata/sdk-ui-dashboard#DashboardEngine} to
     * use for rendering dashboard.
     */
    engineLoaderFactory: DashboardEngineLoaderFactory;

    /**
     * Specify factory for a function that will be used to load instances of plugins to integrate with the dashboard engine.
     */
    pluginLoaderFactory: DashboardPluginsLoaderFactory;

    /**
     * Optionally specify a factory for a function that will be called before engineLoader and pluginLoader.
     * @remarks
     * This function is useful if there are some steps needed for both engine and plugin loading.
     */
    beforeLoadFactory?: DashboardBeforeLoadFactory;
};

const StaticLoadStrategies: DashboardLoaderConfig = {
    engineLoaderFactory: () => staticDashboardEngineLoader,
    pluginLoaderFactory: () => noopDashboardPluginLoader,
};

const AdaptiveLoadStrategies: DashboardLoaderConfig = {
    engineLoaderFactory: adaptiveDashboardEngineLoaderFactory,
    pluginLoaderFactory: adaptiveDashboardPluginLoaderFactory,
    beforeLoadFactory: adaptiveDashboardBeforeLoadFactory,
};

/**
 * @alpha
 */
export class DashboardLoader implements IDashboardLoader {
    private readonly config: DashboardLoaderConfig;
    private baseProps: Partial<IDashboardBasePropsForLoader> = {};
    private embeddedPlugins: IEmbeddedPlugin[] = [];
    private clientWorkspace: IClientWorkspaceIdentifiers | undefined = undefined;
    private moduleFederationIntegration: ModuleFederationIntegration = {
        __webpack_init_sharing__: () => {
            throw new Error("Uninitialized");
        },
        __webpack_share_scopes__: null,
    };

    private constructor(
        config: DashboardLoaderConfig,
        moduleFederationIntegration?: ModuleFederationIntegration,
    ) {
        this.config = config;
        if (moduleFederationIntegration) {
            this.moduleFederationIntegration = moduleFederationIntegration;
        }
    }

    public static staticOnly(): DashboardLoader {
        return new DashboardLoader(StaticLoadStrategies);
    }

    public static adaptive(options: AdaptiveLoadOptions): DashboardLoader {
        return new DashboardLoader(AdaptiveLoadStrategies, options.moduleFederationIntegration);
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
        dashboardWithPlugins: IDashboardWithReferences,
        config: DashboardLoaderConfig = this.config,
    ): Promise<[IDashboardEngine, IDashboardPluginContract_V1[]]> => {
        const { engineLoaderFactory, pluginLoaderFactory, beforeLoadFactory } = config;

        if (beforeLoadFactory) {
            const beforeLoad = beforeLoadFactory(this.moduleFederationIntegration);
            await beforeLoad(ctx, dashboardWithPlugins);
        }

        const engineLoader = engineLoaderFactory(this.moduleFederationIntegration);
        const pluginLoader = pluginLoaderFactory(this.moduleFederationIntegration);

        const [engine, plugins] = await Promise.all([
            engineLoader(dashboardWithPlugins),
            pluginLoader(ctx, dashboardWithPlugins),
        ]);

        const additionalPlugins = initializeEmbeddedPlugins(ctx, this.embeddedPlugins);
        const allPlugins = [...plugins, ...additionalPlugins];

        return [engine, allPlugins];
    };

    public load = async (): Promise<DashboardLoadResult> => {
        const { backend, dashboard, filterContextRef } = this.baseProps;

        invariant(backend, "DashboardLoader is not configured with an instance of Analytical Backend.");
        invariant(
            dashboard,
            "DashboardLoader is not configured with a reference to dashboard that it should load.",
        );

        const [workspace, clientWorkspace] = await this.resolveWorkspace(backend);
        invariant(workspace, "DashboardLoader is not configured with workspace to use and loader.");

        const dashboardWithPlugins: IDashboardWithReferences = await backend
            .workspace(workspace)
            .dashboards()
            .getDashboardWithReferences(dashboard, filterContextRef, undefined, ["dashboardPlugin"]);

        const ctx: DashboardContext = {
            backend,
            workspace,
            dashboardRef: dashboard,
            filterContextRef,
            dataProductId: clientWorkspace?.dataProduct,
            clientId: clientWorkspace?.client,
        };

        const pluginsAreValid = await validatePluginsBeforeLoading(ctx, dashboardWithPlugins);
        if (!pluginsAreValid) {
            // eslint-disable-next-line no-console
            console.error(
                "Dashboard is configured with plugins that contain invalid URLs or " +
                    "are not located on allowed hosts. Loader is falling back to the " +
                    "statically linked dashboard without any external plugins.",
            );
        }

        const [engine, plugins] = await this.loadParts(
            ctx,
            dashboardWithPlugins,
            !pluginsAreValid ? StaticLoadStrategies : this.config,
        );
        const extensionProps: IDashboardExtensionProps = engine.initializePlugins(ctx, plugins);

        const props: IDashboardProps = {
            ...this.baseProps,
            ...extensionProps,
            workspace,
            dashboard: dashboardWithPlugins.dashboard,
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
): IDashboardPluginContract_V1[] {
    return embeddedPlugins.map((embedded) => {
        const plugin = embedded.factory();
        plugin.onPluginLoaded?.(ctx, embedded.parameters);

        return plugin;
    });
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
