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
     * Optionally specify an instance of {@link @gooddata/sdk-ui-dashboard#IDashboardBaseProps} to use for the dashboard component.
     *
     * Note: the base props may also contain backend and workspace parameters. The loader can work with them.
     * If specified, they are equivalent to calling {@link IDashboardLoader.onBackend} and/or {@link IDashboardLoader.fromWorkspace}
     *
     * @param props - base props to use
     */
    withBaseProps(props: IDashboardBaseProps): IDashboardLoader;

    /**
     * Optionally specify additional plugins to use on top of any plugins that the dashboard is already
     * configured to use.
     *
     * @param plugins - extra plugins to use
     */
    withAdditionalPlugins(...plugins: IDashboardPlugin[]): IDashboardLoader;

    /**
     * Load the dashboard, dashboard engine and plugins that should be on the dashboard. Then performs
     * the initialization of the plugins and their registration.
     *
     * Finally, returns result containing the DashboardComponent to render, it's props and details
     * about the plugins that will be in effect once the DashboardComponent gets mounted.
     */
    load(): Promise<DashboardLoadResult>;
}
