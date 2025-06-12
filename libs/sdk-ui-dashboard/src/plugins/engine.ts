// (C) 2021-2023 GoodData Corporation

import { IDashboardPluginContract_V1 } from "./plugin.js";
import { Dashboard, IDashboardExtensionProps, IDashboardProps } from "../presentation/index.js";
import React, { ComponentType } from "react";
import { DashboardCustomizationBuilder } from "./customizationApis/customizationBuilder.js";
import { DefaultDashboardEventHandling } from "./customizationApis/dashboardEventHandling.js";
import { pluginDebugStr } from "./customizationApis/pluginUtils.js";
import { DashboardContext } from "../model/index.js";
import { LIB_VERSION } from "../__version.js";

/**
 * Dashboard Engine encapsulates a particular build of the {@link Dashboard} component and provides
 * factory methods to create the Dashboard component's customization-related props using one or more
 * plugins.
 *
 * @public
 */
export interface IDashboardEngine {
    /**
     * Version of the dashboard engine.
     */
    readonly version: string;

    /**
     * Drives initialization of loaded dashboard plugins and their registration logic.
     *
     * @remarks
     * During registration, the plugins register their customizations, contributions and event handlers.
     *
     * The plugin' contributions will be used to construct the dashboard extension props which can then be
     * used as input to the dashboard component itself and thus achieve the integration of the plugins
     * into the dashboard.
     *
     * @param ctx - dashboard context in which the plugins operate
     * @param plugins - plugins to initialize
     */
    initializePlugins(
        ctx: DashboardContext,
        plugins: IDashboardPluginContract_V1[],
    ): IDashboardExtensionProps;

    /**
     * Returns Dashboard component provided by this dashboard engine.
     */
    getDashboardComponent(): ComponentType<IDashboardProps>;
}

/**
 * A factory function to obtain an instance of {@link IDashboardEngine}.
 *
 * @remarks
 * This is the main, well-known entry point to the Dashboard Engine that is used during both static and dynamic
 * loading of the dashboard engine instances by the DashboardLoader.
 *
 * @public
 */
export function newDashboardEngine(): IDashboardEngine {
    return {
        version: LIB_VERSION,
        initializePlugins(
            ctx: DashboardContext,
            plugins: IDashboardPluginContract_V1[],
        ): IDashboardExtensionProps {
            const customizationBuilder = new DashboardCustomizationBuilder();
            const eventRegistration = new DefaultDashboardEventHandling();

            // eslint-disable-next-line no-console
            console.log(
                `DashboardEngine ${this.version} initializing with plugins: ${plugins
                    .map(pluginDebugStr)
                    .join(", ")}`,
            );

            customizationBuilder.setWidgetOverlays(ctx.config?.widgetsOverlay);

            for (const plugin of plugins) {
                customizationBuilder.onBeforePluginRegister(plugin);

                try {
                    plugin.register(ctx, customizationBuilder, eventRegistration);
                    customizationBuilder.onAfterPluginRegister();
                } catch (e: any) {
                    customizationBuilder.onPluginRegisterError(e);
                }
            }

            const extensionProps = customizationBuilder.build();
            const eventingProps = eventRegistration.getDashboardEventing();

            return {
                ...extensionProps,
                ...eventingProps,
            };
        },
        getDashboardComponent(): React.ComponentType<IDashboardProps> {
            return Dashboard;
        },
    };
}
