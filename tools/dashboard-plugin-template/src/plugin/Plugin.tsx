// (C) 2021 GoodData Corporation
import {
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
} from "@gooddata/sdk-ui-dashboard";

// Implement your plugin here, you can import other files etc. Just keep the component name and make sure it stays exported.

export class Plugin extends DashboardPluginV1 {
    public readonly author = "<your-email>";
    public readonly displayName = "plugin";
    public readonly version = "0.1";

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
