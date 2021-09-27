// (C) 2021 GoodData Corporation

import { IDashboardPlugin } from "./plugin";
import { IDashboardExtensionProps, IDashboardProps } from "../presentation";
import { ComponentType } from "react";

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
     * Time when the engine was built.
     */
    readonly buildTime: string;

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
