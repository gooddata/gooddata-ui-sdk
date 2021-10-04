// (C) 2021 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";
import React from "react";
import {
    IDashboardEngine,
    IDashboardProps,
    IDashboardPlugin,
    IDashboardBaseProps,
} from "@gooddata/sdk-ui-dashboard";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * A result of successful load of a dashboard consists of a React component and constructed props that
 * should be passed to the component in order to mount the dashboard.
 *
 * @alpha
 */
export type DashboardLoadResult = {
    /**
     * Dashboard engine that was loaded.
     */
    engine: IDashboardEngine;

    /**
     * A component that should be mounted in order to render the dashboard.
     */
    DashboardComponent: React.ComponentType<IDashboardProps>;

    /**
     * Props that should be passed to the {@link DashboardLoadResult.DashboardComponent} when mounting.
     */
    props: IDashboardProps;

    /**
     * All plugins that will be in effect on the dashboard. The plugins are already registered and
     * their contributions are reflected in the {@link DashboardLoadResult.props}.
     */
    plugins: IDashboardPlugin[];
};

/**
 * Embedded plugin is implemented, built and linked into the application that loads the dashboard.
 * There is no specific runtime loading and linkage required for these plugins.
 *
 * The lifecycle of embedded plugin is the same as other plugins

 * @alpha
 */
export interface IEmbeddedPlugin {
    /**
     * Factory function to create an instance of the embedded plugin.
     */
    factory: () => IDashboardPlugin;

    /**
     * Parameters to use.
     */
    parameters?: string;
}

/**
 * @alpha
 */
export interface IDashboardLoader {
    /**
     * Specify an instance of Analytical Backend that hosts the dashboards.
     *
     * @param backend - an instance of analytical backend
     */
    onBackend(backend: IAnalyticalBackend): IDashboardLoader;

    /**
     * Specify identifier of workspace where the dashboard is stored.
     *
     * @param workspace - identifier of workspace
     */
    fromWorkspace(workspace: string): IDashboardLoader;

    /**
     * Alternatively specify workspace indirectly, using data product, segment and client identifier.
     *
     * Note: this indirect method of identification is not supported by all backends. At this moment, only
     * the 'bear' backend allows this - and it does so only when it's Life Cycle Management features are
     * employed in the solution.
     *
     * @param clientWorkspace - complex identifier of the client workspace
     */
    fromClientWorkspace(clientWorkspace: IClientWorkspaceIdentifiers): IDashboardLoader;

    /**
     * Specify dashboard to load.
     *
     * @param dashboardRef - reference to an existing dashboard.
     */
    forDashboard(dashboardRef: ObjRef): IDashboardLoader;

    /**
     * Optionally specify an instance of {@link @gooddata/sdk-ui-dashboard#IDashboardBaseProps} to use for the dashboard component.
     *
     * Note: the base props may also contain backend and workspace parameters. The loader can work with them.
     * If specified, they are equivalent to calling {@link IDashboardLoader.onBackend} and/or {@link IDashboardLoader.fromWorkspace}
     *
     * @param props - base props to use
     */
    withBaseProps(props: IDashboardBaseProps): IDashboardLoader;

    /**
     * Optionally specify embedded plugins to use on top of any plugins that the dashboard is already
     * configured to use.
     *
     * The embedded plugins are implemented, built and linked into the application that loads the dashboard.
     * There is no specific runtime loading and linkage required for these plugins.
     *
     * The lifecycle of the embedded plugins follows the lifecycle of normal plugins that may be linked with
     * the dashboard; instead of loading the plugin assets, the loader will call embedded plugin's
     * factory function to obtain an instance of the actual dashboard plugin to use. From this point on,
     * the lifecycle is the same as for normal plugins:
     *
     * 1.  The loader will call the onPluginLoaded, pass any parameters that may be specified for the embedded plugin
     * 2.  Plugin registration is done same as for normal plugins
     * 3.  The loader will call onPluginUnloaded when the dashboard containing the plugins gets unmounted
     *
     * @param plugins - extra plugins to use
     */
    withEmbeddedPlugins(...plugins: IEmbeddedPlugin[]): IDashboardLoader;

    /**
     * Load the dashboard, dashboard engine and plugins that should be on the dashboard. Then performs
     * the initialization of the plugins and their registration.
     *
     * Finally, returns result containing the DashboardComponent to render, it's props and details
     * about the plugins that will be in effect once the DashboardComponent gets mounted.
     */
    load(): Promise<DashboardLoadResult>;
}
