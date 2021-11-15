// (C) 2021 GoodData Corporation
import {
    DashboardContext,
    DashboardEventBody,
    DashboardEvents,
    DashboardInitialized,
    DashboardSaved,
    DashboardState,
    disableInsightWidgetDateFilter,
    ICustomDashboardEvent,
    selectInsights,
    useDashboardDispatch,
    useDashboardEventDispatch,
} from "../model";
import { IDashboardCustomizer, IDashboardEventHandling } from "./customizer";

import { DashboardPluginV1 } from "./plugin";
import { idRef, IInsight, insightMeasures, measureTitle } from "@gooddata/sdk-model";
import { InsightComponentProvider, useDashboardInsightProps } from "../presentation";
import React, { useMemo } from "react";

//
// Eventing
//

export class PluginOnlyHandlingEvents extends DashboardPluginV1 {
    public readonly author: string = "author@email.com";
    public readonly displayName: string = "My Plugin Name";
    public readonly version: string = "1.0.0";
    public readonly debugName: string = "some-internal-name";
    public readonly shortDescription: string = "This plugin handles events in arbitrary way.";
    public readonly longDescription: string = "One could specify a longer, multi-line description here.";

    private handlers: IDashboardEventHandling | undefined;

    private catchAllEventHandler = (_event: DashboardEvents): void => {
        /* do something with the event */
    };

    private dashboardInitializedHandler = (_event: DashboardInitialized): void => {
        /* do something after initialization */

        // for example sakes, let's say the handler needs to remove itself
        this.handlers?.removeEventHandler("GDC.DASH/EVT.INITIALIZED", this.dashboardInitializedHandler);
    };

    public register(
        _ctx: DashboardContext,
        _customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        // plugin may hold onto the event handling facade and add/remove handlers later on
        this.handlers = handlers;

        // all events with be sent to catchAllEventHandler
        handlers.addEventHandler("*", this.catchAllEventHandler);
        // on top of that, the event describing dashboard initialization will be sent to custom handler
        handlers.addEventHandler("GDC.DASH/EVT.INITIALIZED", this.dashboardInitializedHandler);
        // additionally, event handlers with custom event evaluation functions may be provided
        handlers.addCustomEventHandler({
            eval: (_evt) => {
                /* custom evaluation logic to gate events that should be handled */
                return true;
            },
            handler: (_evt) => {
                /* custom event handling logic */
            },
        });
    }
}

//
// Eventing & working with dashboard state in event handlers
//

export class PluginHandlingEventsAndWorkingWithModel extends DashboardPluginV1 {
    public readonly author: string = "author@email.com";
    public readonly displayName: string = "My Plugin Name";
    public readonly version: string = "1.0.0";
    public readonly debugName: string = "some-internal-name";
    public readonly shortDescription: string =
        "This plugin handles events in arbitrary way and retrieves additional data from state while doing so.";
    public readonly longDescription: string = "One could specify a longer, multi-line description here.";

    private currentState: DashboardState | undefined;

    private dashboardSavedHandler = (_event: DashboardSaved): void => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const _insights: IInsight[] = selectInsights(this.currentState!);

        /* do something with insights used on a dashboard, inspect them, log extra telemetry etc */
    };

    public register(
        _ctx: DashboardContext,
        _customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        handlers.addEventHandler("GDC.DASH/EVT.SAVED", this.dashboardSavedHandler);

        // subscribe to be notified about dashboard state changes; this is so that the plugin can hold onto
        // the latest state of the dashboard and use the Selector API from non-react code - for instance
        // custom event handlers
        handlers.subscribeToStateChanges((state) => {
            this.currentState = state;
        });
    }
}

//
// Custom Insight Rendering
//

function CustomInsightRenderer() {
    const { insight } = useDashboardInsightProps();

    // render the insight differently; just doing something dummy for example sakes
    return <div>{insightMeasures(insight).map(measureTitle).join(", ")}</div>;
}

export class PluginAddsCustomInsightRendering extends DashboardPluginV1 {
    public readonly author: string = "author@email.com";
    public readonly displayName: string = "My Plugin Name";
    public readonly version: string = "1.0.0";
    public readonly debugName: string = "some-internal-name";
    public readonly shortDescription: string =
        "This plugin customizes rendering of insights with particular tags.";
    public readonly longDescription: string = "One could specify a longer, multi-line description here.";

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        customize.insightWidgets().withTag("some-tag", CustomInsightRenderer);
    }
}

//
// Parameterized custom Insight Rendering
//

export class PluginAddsParameterizedInsightRendering extends DashboardPluginV1 {
    public readonly author: string = "author@email.com";
    public readonly displayName: string = "My Plugin Name";
    public readonly version: string = "1.0.0";
    public readonly debugName: string = "some-internal-name";
    public readonly shortDescription: string =
        "This plugin customizes rendering of insights with particular tags; the names of tags come in as " +
        "parameters that may be specified on dashboard when it links to the plugin.";
    public readonly longDescription: string = "One could specify a longer, multi-line description here.";

    private customizeByTag: string[] = [];

    public onPluginLoaded = (_ctx: DashboardContext, parameters?: string): void => {
        if (parameters) {
            this.customizeByTag = parameters.split(",").map((val) => val.trim());
        }
    };

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        this.customizeByTag.forEach((tag) => {
            customize.insightWidgets().withTag(tag, CustomInsightRenderer);
        });
    }
}

//
// Advanced: insight component decorators - embellish insight renderers.
//

function customDecoratorFactory(next: InsightComponentProvider): InsightComponentProvider {
    // this decorator will be used to embellish all rendered insights
    return () => {
        function Decorator() {
            // get dispatch function so that the decorator can send commands to the model
            const dispatch = useDashboardDispatch();
            // get the insight that is being rendered and the widget to which it belongs
            const { insight, widget } = useDashboardInsightProps();
            // obtain the actual component that renders the insight; this may be the default renderer or
            // custom renderer.. or event another decorator on top of the actual renderers
            const Decorated = useMemo(() => next(insight, widget)!, [insight, widget]);

            const disableDateFilter = () => {
                // dispatch command to disable date filter for the current widget
                dispatch(disableInsightWidgetDateFilter(widget.ref));
            };

            return (
                <div>
                    <button value={"Disable Date Filter"} onClick={disableDateFilter} />
                    <Decorated />
                </div>
            );
        }

        return Decorator;
    };
}

export class PluginAddsCustomInsightDecorator extends DashboardPluginV1 {
    public readonly author: string = "author@email.com";
    public readonly displayName: string = "My Plugin Name";
    public readonly version: string = "1.0.0";
    public readonly debugName: string = "some-internal-name";
    public readonly shortDescription: string =
        "This plugin customizes rendering of all insights to include additional decorations/embellishments";
    public readonly longDescription: string = "One could specify a longer, multi-line description here.";

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        // register custom renderer for insights with some tags
        customize.insightWidgets().withTag("some-tag", CustomInsightRenderer);
        // register decorator that will be used during any insight rendering - regardless if using custom renderer or
        // the default renderer
        customize.insightWidgets().withCustomDecorator(customDecoratorFactory);
    }
}

//
// Custom widgets with custom event example
//

// define type for a custom event, this one has payload with property "greeting" of type string
type MyCustomEvent = ICustomDashboardEvent<{ greeting: string }>;

const TestWidget: React.FC = () => {
    const dispatch = useDashboardEventDispatch();
    return (
        <button
            type="button"
            onClick={() => {
                // trigger the custom event
                const event: DashboardEventBody<MyCustomEvent> = {
                    // custom event names must start with `CUSTOM/EVT` prefix
                    type: "CUSTOM/EVT/MY_EVENT",
                    payload: {
                        greeting: "hello",
                    },
                };
                dispatch(event);
            }}
        >
            Trigger custom event
        </button>
    );
};

export class PluginAddsCustomWidget extends DashboardPluginV1 {
    public readonly author: string = "author@email.com";
    public readonly displayName: string = "My Plugin Name";
    public readonly version: string = "1.0.0";
    public readonly debugName: string = "some-internal-name";
    public readonly shortDescription: string =
        "This plugin adds a new section at the end of dashboard with a custom widget there that can trigger custom events.";
    public readonly longDescription: string = "One could specify a longer, multi-line description here.";

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        // register custom widget type to use the TestWidgetComponent
        customize.customWidgets().addCustomWidget("test", TestWidget);

        // add a new section at the end of the layout
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(-1, {
                items: [
                    {
                        size: { xl: { gridWidth: 6 } },
                        type: "IDashboardLayoutItem",
                        widget: {
                            // this custom type must match the type used in the addCustomWidget call
                            customType: "test",
                            identifier: "foo",
                            ref: idRef("foo"),
                            type: "customWidget",
                            uri: "foo/bar",
                        },
                    },
                ],
                type: "IDashboardLayoutSection",
                header: {
                    title: "Hi from plugin",
                },
            });
        });

        // register handler for the custom event
        handlers.addCustomEventHandler({
            eval: (e) => e.type === "CUSTOM/EVT/MY_EVENT",
            handler: (e: MyCustomEvent) => {
                // eslint-disable-next-line no-console
                console.log("Custom event received", e.payload?.greeting);
            },
        });
    }
}
