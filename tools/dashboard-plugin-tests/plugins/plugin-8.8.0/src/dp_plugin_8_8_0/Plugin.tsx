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
    IDashboardInsightProps,
    IDashboardKpiProps,
} from "@gooddata/sdk-ui-dashboard";

import entryPoint from "../dp_plugin_8_8_0_entry";

import React from "react";
import { withDashboardPluginTestEventHandling } from "../../../../cypress/support/events";

/*
 * Component to render 'myCustomWidget'. If you create custom widget instance and also pass extra data,
 * then that data will be available in
 */
function MyCustomWidget(_props: IDashboardWidgetProps): JSX.Element {
    return <div className="s-custom-widget">Hello from test widget</div>;
}

function MyCustomInsightWidget(_props: IDashboardInsightProps): JSX.Element {
    return <div className="s-custom-insight-widget">Hello from custom insight widget</div>;
}

function MyCustomTagInsightWidget(_props: IDashboardInsightProps): JSX.Element {
    return <div className="s-custom-tag-insight-widget">Hello from custom tag insight widget</div>;
}

function MyCustomKpiWidget(_props: IDashboardKpiProps): JSX.Element {
    return <div className="s-custom-kpi-widget">Hello from custom kpi widget</div>;
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
        // Insight Widgets API
        customize.insightWidgets().withTag("insightTag", MyCustomTagInsightWidget);
        customize.insightWidgets().withCustomProvider((_insight, widget) => {
            if (widget.title !== "Use Custom Insight Provider") {
                return undefined;
            }
            return MyCustomInsightWidget;
        });
        customize.insightWidgets().withCustomDecorator((next) => (insight, widget) => {
            if (widget.title !== "Decorate This Insight") {
                return undefined;
            }

            function MyCustomDecorator(props: IDashboardInsightProps) {
                const Decorated = next(insight, widget);

                return (
                    <div className="s-decorated-insight-widget">
                        <Decorated {...props} />
                    </div>
                );
            }

            return MyCustomDecorator;
        });

        // Kpi Widgets API
        customize.kpiWidgets().withCustomProvider((_kpi, widget) => {
            if (widget.title !== "Use Custom Kpi Provider") {
                return undefined;
            }
            return MyCustomKpiWidget;
        });
        customize.kpiWidgets().withCustomDecorator((next) => (kpi, widget) => {
            if (widget.title !== "Decorate This Kpi") {
                return undefined;
            }

            function MyCustomDecorator(props: IDashboardKpiProps) {
                const Decorated = next(kpi, widget);

                return (
                    <div className="s-decorated-kpi-widget">
                        <Decorated {...props} />
                    </div>
                );
            }

            return MyCustomDecorator;
        });

        // Custom Widgets API
        customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);

        // Layout API
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

        // Handlers API
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
