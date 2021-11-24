// (C) 2007-2021 GoodData Corporation
import React from "react";
import {
    DashboardConfig,
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
    IDashboardWidgetProps,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { LoadingComponent } from "@gooddata/sdk-ui";

const dashboardRef = idRef("aeO5PVgShc0T");
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

/*
 * Component to render 'myCustomWidget'. If you create custom widget instance and also pass extra data,
 * then that data will be available in
 */
function MyCustomWidget(_props: IDashboardWidgetProps): JSX.Element {
    return <div>Hello from custom widget</div>;
}

class LocalPlugin extends DashboardPluginV1 {
    public readonly author = "John Doe";
    public readonly displayName = "Sample local plugin";
    public readonly version = "1.0";

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(
                0,
                newDashboardSection(
                    "Section Added By Plugin",
                    newDashboardItem(newCustomWidget("myWidget1", "myCustomWidget"), {
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
    }
}

const LocalExtraPlugin = {
    factory: () => new LocalPlugin(),
};

const DashboardComponentWithLocalPlugin: React.FC = () => {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        // indicate that only local plugins should be used
        loadingMode: "staticOnly",
        // define the extra plugins, this can also be an array
        extraPlugins: LocalExtraPlugin,
    });

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (error) {
        return <div>Error loading dashboard...</div>;
    }

    // the loader result returns the component to be used
    // and also props that need to be passed to it
    const { DashboardComponent, props: dashboardProps } = result!;
    return (
        <div>
            <DashboardComponent {...dashboardProps} config={config} />
        </div>
    );
};

export default DashboardComponentWithLocalPlugin;
