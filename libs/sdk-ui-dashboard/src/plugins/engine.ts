// (C) 2021 GoodData Corporation

import { IDashboardPlugin } from "./plugin";
import { Dashboard, IDashboardExtensionProps, IDashboardProps } from "../presentation";
import React, { ComponentType } from "react";
import { DashboardCustomizationBuilder } from "./customizationApis/customizationBuilder";
import { DefaultDashboardEventHandling } from "./customizationApis/dashboardEventHandling";
import { pluginDebugStr } from "./customizationApis/pluginUtils";
import { DashboardContext } from "../model";

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
     * @param ctx - dashboard context in which the plugins operate
     * @param plugins - plugins to initialize
     */
    initializePlugins(ctx: DashboardContext, plugins: IDashboardPlugin[]): IDashboardExtensionProps;

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
        // TODO: this must be filled in automatically .. somehow; the problem with getting the value from
        //  package.json directly is that the resolveJsonModules tsconfig setting (which we need) leads to
        //  messing up the dist&esm. tsc will include all model stuff under dist/src instead of putting it
        //  directly under dist
        version: "8.7.0",
        initializePlugins(ctx: DashboardContext, plugins: IDashboardPlugin[]): IDashboardExtensionProps {
            const customizationBuilder = new DashboardCustomizationBuilder();
            const eventRegistration = new DefaultDashboardEventHandling();

            // eslint-disable-next-line no-console
            console.log(
                `DashboardEngine ${this.version} initializing with plugins: ${plugins
                    .map(pluginDebugStr)
                    .join(", ")}`,
            );

            for (const plugin of plugins) {
                customizationBuilder.onBeforePluginRegister(plugin);

                try {
                    plugin.register(ctx, customizationBuilder, eventRegistration);
                    customizationBuilder.onAfterPluginRegister();
                } catch (e: any) {
                    customizationBuilder.onPluginRegisterError(e);
                }
            }

            return customizationBuilder.build();
        },
        getDashboardComponent(): React.ComponentType<IDashboardProps> {
            return Dashboard;
        },
    };
}
