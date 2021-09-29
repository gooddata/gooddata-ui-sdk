// (C) 2021 GoodData Corporation

import { IDashboardPlugin } from "./plugin";
import { Dashboard, IDashboardExtensionProps, IDashboardProps } from "../presentation";
import React, { ComponentType } from "react";

/**
 * Dashboard Engine encapsulates a particular build of the `Dashboard` component and provides
 * factory methods to create the Dashboard component's customization-related props using one or more
 * plugins.
 *
 * @alpha
 */
export interface IDashboardEngine {
    /**
     * Version of the dashboard engine.
     */
    readonly version: string;

    /**
     * Drives initialization of loaded dashboard plugins and their registration logic. During registration,
     * the plugins register their customizations, contributions and event handlers.
     *
     * The plugin' contributions will be used to construct the dashboard extension props which can then be
     * used as input to the dashboard component itself and thus achieve the integration of the plugins
     * into the dashboard.
     *
     * @param plugins - plugins to initialize
     */
    initializePlugins(plugins: IDashboardPlugin[]): IDashboardExtensionProps;

    /**
     * Returns Dashboard component provided by this dashboard engine.
     */
    getDashboardComponent(): ComponentType<IDashboardProps>;
}

/**
 * A factory function to obtain an instance of {@link IDashboardEngine}. This is the main, well-known entry
 * point to the Dashboard Engine that is used during both static and dynamic loading of the dashboard engine
 * instances by the DashboardLoader.
 *
 * @alpha
 */
export function newDashboardEngine(): IDashboardEngine {
    return {
        version: "8.6.0",
        initializePlugins(_plugins: IDashboardPlugin[]): IDashboardExtensionProps {
            // TODO: add logic to build extension props, using customizer etc etc
            return {};
        },
        getDashboardComponent(): React.ComponentType<IDashboardProps> {
            return Dashboard;
        },
    };
}
