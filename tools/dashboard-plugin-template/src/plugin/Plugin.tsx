// (C) 2021 GoodData Corporation
import {
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
} from "@gooddata/sdk-ui-dashboard";

import packageJson from "../../package.json";

// Implement your plugin here, you can import other files etc. Just keep the component name and make sure it stays exported.

export class Plugin extends DashboardPluginV1 {
    public readonly author = packageJson.author;
    public readonly displayName = packageJson.name;
    public readonly version = packageJson.version;

    public onPluginLoaded(_ctx: DashboardContext, _parameters?: string) {
        /*
         * This will be called when the plugin is loaded in context of some dashboard and before
         * the register() method.
         *
         * If the link between the dashboard and this plugin is parameterized, then all the parameters will
         * be included in the parameters string.
         *
         * The parameters are useful to modify plugin behavior in context of particular dashboard.
         */
    }

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(-1, {
                items: [],
                type: "IDashboardLayoutSection",
                header: {
                    title: "Added from a plugin",
                },
            });
        });
        handlers.addEventHandler("GDC.DASH/EVT.INITIALIZED", (evt) => {
            // eslint-disable-next-line no-console
            console.log("### Dashboard initialized", evt);
        });
    }
}
