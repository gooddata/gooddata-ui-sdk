// (C) 2021-2022 GoodData Corporation
import {
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
    IDashboardWidgetProps,
    newDashboardSection,
    newDashboardItem,
    newCustomWidget,
} from "@gooddata/sdk-ui-dashboard";

import entryPoint from "../dp_test_plugin_entry";

import React from "react";

import { withDashboardPluginTestEventHandling } from "../../../../src/infra";

function CustomWidget(_props: IDashboardWidgetProps): JSX.Element {
    return <div className="s-custom-widget">Hello from test widget</div>;
}

export class Plugin extends DashboardPluginV1 {
    public readonly author = entryPoint.author;
    public readonly displayName = entryPoint.displayName;
    public readonly version = entryPoint.version;
    public readonly minEngineVersion = entryPoint.minEngineVersion;
    public readonly maxEngineVersion = entryPoint.maxEngineVersion;

    public onPluginLoaded(_ctx: DashboardContext, _parameters?: string): Promise<void> | void {
        /*
         * This will be called when the plugin is loaded in context of some dashboard and before
         * the register() method.
         *
         * If the link between the dashboard and this plugin is parameterized, then all the parameters will
         * be included in the parameters string.
         *
         * The parameters are useful to modify plugin behavior in context of particular dashboard.
         *
         * Note: it is safe to delete this stub if your plugin does not need any specific initialization.
         */
    }

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        customize.customWidgets().addCustomWidget("customWidget", CustomWidget);
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(
                0,
                newDashboardSection(
                    "Section Added By Plugin",
                    newDashboardItem(newCustomWidget("myWidget1", "customWidget"), {
                        xl: {
                            // all 12 columns of the grid will be 'allocated' for this this new item
                            gridWidth: 12,
                            // minimum height since the custom widget now has just some one-liner text
                            gridHeight: 1,
                        },
                    }),
                ),
            );
        });

        withDashboardPluginTestEventHandling(handlers);
    }

    public onPluginUnload(_ctx: DashboardContext): Promise<void> | void {
        /*
         * This will be called when user navigates away from the dashboard enhanced by the plugin. At this point,
         * your code may do additional teardown and cleanup.
         *
         * Note: it is safe to delete this stub if your plugin does not need to do anything extra during unload.
         */
    }
}
