---
legacy_path: references/dashboard_component/dashboard_plugins_api
title: Dashboard plugin API
category: Dashboard & plugins
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-dashboard:IDashboardCustomizationProps"
source_files:
  - src/presentation/dashboard/types.ts
props_interfaces:
  - IDashboardCustomizationProps
  - IDashboardCustomComponentProps
related_pages:
  - /docs/dashboard-plugins/dashboard-plugins
  - /docs/dashboard-plugins/develop-your-first-plugin
  - /docs/dashboard-plugins/customize-widgets
  - /docs/dashboard-plugins/dashboard-events
  - /docs/dashboard-plugins/use-dashboard-selector
type: docs
description: Implement the dashboard plugin lifecycle, customize visualizations, widgets, layouts, filters, and exports, and register dashboard event handlers.
weight: 32
section: Dashboard & plugins
aliases:
  - "../references/dashboard_component/dashboard_plugins_api/"
---

Use this page to implement the plugin contract and choose the dashboard API
that matches the behavior you want to change. The main extension points are:

- visualization rendering through `insightWidgets()`;
- arbitrary content through `customWidgets()`;
- dashboard structure and exports through `layout()`;
- filters through `filterBar()` and `filters()`; and
- dashboard events and state through the event handler API, selectors, and commands.

All the public and most of the beta-level APIs have detailed TSDoc comments, from which the
[API reference]({{< relref "/latest/api-reference/sdk-ui-dashboard" >}}) is generated.

## Plugin contract

The plugin contract is the first API that you will come in contact with. The contract defines properties that you need
to fill in and functions to implement, including the functions that allow you to specify code
to run on load, during registration, and after unload.

A new plugin that is bootstrapped with `@gooddata/plugin-toolkit` sets up
all the contract essentials and provides a template implementation of some of the functions by subclassing
the `DashboardPluginV1`.

You can modify your subclass as needed. You can even add a plugin-specific internal state into this class, if needed.

### onPluginLoaded

When implemented, this function is called right after your plugin is loaded and is about to be used on a dashboard.
At this point, your code receives information about the context in which it will operate. Most notably:

-   The Analytical Backend that is currently in use, authenticated and ready to use in case your plugin needs to read additional data from the backend
-   The workspace that the user works with
-   The reference of the dashboard that is about to be loaded
-   The dashboard configuration, if the embedding application passed one

This function may return a promise. In that case, the dashboard loader waits until the promise is resolved and
then proceeds. The loader does not impose any timeout on the `onPluginLoaded` call. If you make calls over the network,
a good practice is to consider potential failures and include timeouts and necessary fallbacks.

{{% alert color="warning" title="A failing onPluginLoaded excludes the plugin" %}}
If your implementation of this function fails with an exception, the loader excludes your plugin from further processing.
{{% /alert %}}

#### Parameterization

To allow a plugin to be reused across dashboards, you can make each link between a dashboard and your plugin specify
additional parameters. These parameters can then be used to customize the behavior of the plugin for
a particular dashboard.

GoodData treats parameters opaquely. Only soft-size limits of 2,048 bytes for
the length of the parameter string are imposed. Otherwise, the parameters are fully under your control and responsibility.

If the parameters are specified on the link between a dashboard and your plugin, the loader sends them as the
second argument to the `onPluginLoaded` function.

### register

This is a mandatory function that your plugin must implement. This function is called after the plugin is loaded.
In this function, you then can register customizations to the dashboard.

Your function is always called with the following parameters:

-   Dashboard context

    Similar to `onPluginLoaded`, the context contains essential information describing the backend, workspace, and
    dashboard.

-   Customization API

    The customization API allows your code to add new content to a dashboard. Calls to these APIs are only valid
    during the registration phase. If you hold onto the received APIs and attempt to make changes later on, they
    will have no effect and will result in warnings in the browser console.

-   Event handler API

    The event handler API allows your code to add or remove your own custom event handlers for different events
    happening on the dashboard. If needed, you can hold onto the event handler API and use it to add or remove handlers
    at any time during the plugin lifecycle.

### onPluginUnload

When implemented, this function is called right before the dashboard that uses your plugin is unmounted.
In this function, your code can do additional teardown and cleanup specific to your plugin.

Your function may be asynchronous and return a promise. At this point, the dashboard loader does not wait for the returned
promise to resolve.

## Customization API

The customization API is an entry point to all the customization and enhancement capabilities that your code can take advantage of. The
API is described in detail in the [API reference]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardcustomizer.md" >}}).

### Customize rendering of visualizations

Call the `insightWidgets()` method on the customization API to get to the API through which you can customize
how the [visualization widgets]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardinsightcustomizer.md" >}})
on your dashboard will be rendered. [Customize widgets and visualizations](../customize-widgets/) explains how
these methods relate to the widget, visualization, and visualization body layers, and when to replace only the body.

-   To **render data for one or more visualizations** using your own custom visualizations, the visualization widget customization API provides the following methods:

    -   `withCustomProvider()`

        When calling this method, you can register a function that will be called by the Dashboard component every time it
        wants to render a visualization widget. The function will receive a widget definition and the visualization to be rendered. This function
        is expected to return a React component to use for rendering that widget. If the function does not return
        a custom component, the Dashboard component falls back and uses the built-in component.

        Your function must determine that a particular visualization widget should be rendered using
        a custom component and then return the custom component. How your function determines this is up to you.

    -   `withTag()`

        This is a convenience method on top of the `withCustomProvider` method. To identify visualization widgets to render
        using custom components, use tags. You can assign arbitrary tags to your saved visualizations and then use this
        method to register a renderer for the visualization widgets that have this tag.

        To tag a visualization, set `attributes.tags` on its `visualizationObjects` entity through the
        [GoodData Cloud API](https://www.gooddata.ai/docs/cloud/api-and-sdk/api/api_reference_all/).

-   To **add additional elements on top of the visualization widgets** that are rendered using the built-in renderers, the visualization widget customization API provides
    a method to register a "decorator" called `withCustomDecorator()`.

    In some way, the decorators resemble a concept of middleware that you may be familiar with from `express` or `redux`. Instead of
    registering a function that evaluates the widget and visualization and returns a React component, for decorators you have to
    register a factory function. This factory function receives a provider for the component to decorate
    and must then return a function to provide a decorator component. The function to return has the same signature as
    the visualization provider function that you register in `withCustomProvider`.

    This is best described in code:

    ```tsx
    import { insightTags } from "@gooddata/sdk-model";
    import type { IDashboardCustomizer, IDashboardInsightProps } from "@gooddata/sdk-ui-dashboard";

    export function registerDecorator(customize: IDashboardCustomizer): void {
        customize.insightWidgets().withCustomDecorator((next) => {
            return (insight, widget) => {
                if (!insightTags(insight).includes("decorate")) {
                    return undefined;
                }

                // Make sure you call this outside the component render function,
                // otherwise a new instance of the decorated component is created on each re-render.
                const Decorated = next(insight, widget);

                function MyCustomDecorator(props: IDashboardInsightProps) {
                    return (
                        <div>
                            <p>My Custom Decoration</p>
                            <Decorated {...props} />
                        </div>
                    );
                }

                return MyCustomDecorator;
            };
        });
    }
    ```

#### Enable CSV and XLSX export for custom visualization renderers

When a plugin replaces a visualization renderer, it must call or forward the
`pushData` callback when the visualization data is ready. The Dashboard
component uses the data supplied through `pushData` to enable the CSV and XLSX
options in the widget's Export popup.

If the renderer does not call `pushData`, the widget's Export popup does not
offer CSV or XLSX export, even if the renderer has loaded the data itself.

Forward the callback to the GoodData.UI visualization component:

```tsx
import { InsightView } from "@gooddata/sdk-ui-ext";
import type { IDashboardInsightProps } from "@gooddata/sdk-ui-dashboard";

function CustomVisualization(props: IDashboardInsightProps) {
    return <InsightView insight={props.insight} pushData={props.pushData} />;
}
```

This requirement applies to visualization renderers registered through
`insightWidgets()`. Arbitrary custom widgets registered through
`customWidgets()` receive `IDashboardWidgetProps` and do not receive this
visualization callback.

### Use custom widgets

With custom widgets, you can enrich dashboards with arbitrary content. For example, your dashboard can use
the built-in visualization and widget renderers and then use the custom widgets to add extra content such as images,
additional text, or forms.

You must first register a custom widget type, which is a declaration of the custom widget type. The declaration links the custom widget type name and the React component to use for rendering.

Once you have registered the custom widget type, you can add any number of widgets of this type to your dashboard using the layout manipulation API.

The default plugin bootstrapped by `@gooddata/plugin-toolkit` defines a sample custom widget
that you can try out right away.

#### Register types of custom widgets

Call the `customWidgets()` method on the customization API to get to the API through which you can
register [custom widget types]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardwidgetcustomizer.md" >}}).

Use the `addCustomWidget()` method to register a custom widget type and provide your custom React component. The
props for this component will be of the `IDashboardWidgetProps` type. The `widget` property contains a payload
for the custom widget.

#### Add custom widgets to a dashboard

Once you have a custom widget type registered, you can add instances of the widgets of this type to a dashboard. To do so,
use the layout manipulation API.

Call the `layout()` method on the customization API to get to the API through which you can
[customize the layout]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardlayoutcustomizer.md" >}}).
To be prepared for different types of layouts that may be implemented in the future, the layout manipulation API contains
methods to customize the layout of a particular type.

The Dashboard component supports only the fluid 12-column grid layout. To customize this layout, use
the `customizeFluidLayout()` function to register your customization function.

You have to implement the fluid layout customization function yourself. This function is called with
the following parameters:

-   The layout as currently defined on the dashboard

    The layout is provided so that your code can inspect the layout and determine what and where
    to customize if needed. Depending on your use case, you may or may not need to inspect the layout. For instance, if you
    are adding a custom header on top of the dashboard, you can just do that.

-   [The fluid layout customization API]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.ifluidlayoutcustomizer.md" >}})

    This API allows you to add new sections (rows) to a dashboard or add new items (columns) to existing
    sections. Use `addSectionToPath` to add a section and `addItemToPath` to add an item. Both take a path
    instead of a plain index, so they can also target sections and items nested inside a layout widget:

    -   A section path is an object: `{ sectionIndex: 0 }` in the root layout, plus a `parent` item path when
        the section is nested.
    -   An item path is an array of `{ sectionIndex, itemIndex }` coordinates, one per level of nesting.

    Pass `-1` as an index to append at the end.

{{% alert color="info" title="The layout customization runs once" %}}
The function that you register here is called once during the dashboard initialization, to modify
the layout before it is stored in the Dashboard component's state. It can't change a layout that is
already rendered. To add, move, or remove widgets after the Dashboard component renders, use its alpha-level commands.
{{% /alert %}}

{{% alert color="warning" %}}
`addSection` and `addItem`, which take plain numeric indexes, are deprecated. Use `addSectionToPath` and
`addItemToPath` instead; they take the same section and item objects.
{{% /alert %}}

#### Create sections, items, and custom widgets

Don't create sections, items, and custom widget objects by hand. Use the factory functions of the Dashboard component:

-   `newDashboardSection` creates a new section (row) with a number of items (columns) that contain custom widgets.
-   `newDashboardItem` creates a new item (column) that contains a custom widget.
-   `newCustomWidget` creates a custom widget.

    When creating a custom widget, you have to specify a unique identifier for this widget, the type of the custom widget,
    and optionally additional data to include in the widget.

    The custom widget renderer that you registered previously will receive all this information so you can customize rendering
    based on the additional data.

#### Calculate data for a custom widget

When creating a custom widget, you often need to calculate some data for it similar to how the standard widgets do it.
To calculate data for a custom widget, use the following convenient hooks:

-   [`useCustomWidgetExecutionDataView()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.usecustomwidgetexecutiondataview.md" >}}) allows you to get data for free-form execution in the context of the widget.
-   [`useCustomWidgetInsightDataView()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.usecustomwidgetinsightdataview.md" >}}) allows you to get data for a specific visualization in the context of the widget.

By default, the data computation respects the filters set on the dashboard. If you want a custom widget to ignore some filters during the data computation, set it up when creating the widget using the `newCustomWidget()` function:

```ts
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import { newCustomWidget } from "@gooddata/sdk-ui-dashboard";
import * as Md from "./catalog.js";

const customWidget = newCustomWidget("myWidget1", "myCustomWidget", {
    // specify which date dataset to use when applying the date filter to this widget
    // if not specified, the date filter is ignored
    dateDataSet: Md.DateDatasets.Date,
    // specify which attribute filters to ignore for this widget
    // if empty or not specified, all attribute filters are applied
    ignoreDashboardFilters: [
        {
           type: "attributeFilterReference",
           displayForm: attributeDisplayFormRef(Md.RestaurantCategory),
        },
    ],
});
```

#### Trigger commands from a custom widget

To interact with the dashboard from within a custom widget, dispatch commands with
[`useDispatchDashboardCommand`](../dashboard/#commands).

#### Prepare custom widget for PDF exports

If you are loading asynchronous data for your custom widget or visualization, use `useDashboardAsyncRender` so
export waits for it. Exports render on a GoodData service that loads the dashboard with your plugin, see
[Exports and scheduled deliveries](../dashboard-plugins/#exports-and-scheduled-deliveries). To trigger a
whole-dashboard export, detect export mode in a custom widget, or customize how a dashboard decomposes into
export slides, see [Customize dashboard export](../customize-dashboard-export/).

### Customize the filter bar

Call the `filterBar()` method on the customization API to get the API through which you can customize how the Filter bar will be rendered on your dashboard.

To change the rendering mode of the Filter bar, call the `setRenderingMode` method with one of the following parameters:

-   `"default"` shows the Filter bar as usual. This is equal to when you do not call the `setRenderingMode` method at all.
-   `"hidden"` hides the Filter bar.

    This only hides the Filter bar from the user interface. The filters that are set still apply.

### Customize attribute filters and date filter

Call the `filters()` method on the customization API to get the API through which you can customize how the attribute or date filters will be rendered on your dashboard. It has one method per filter kind: `attribute()` returns the attribute filters customization API and `date()` returns the date filters customization API.

-   To **render one or more attribute filters** using your custom components, the attribute filters customization API (`filters().attribute()`) provides the `withCustomProvider()` method [similar to visualization widgets](#customize-rendering-of-visualizations).

    When calling this method, you can register a function that will be called by the Dashboard component every time it
    wants to render an attribute filter. The function will receive a filter definition to be rendered. This function
    is expected to return a React component to use for rendering that attribute filter. If the function does not return
    a custom component, the Dashboard component falls back and uses the built-in component.

    Your function must determine that a particular attribute filter should be rendered using
    a custom component and then return the custom component. How your function determines this is up to you.

    To [customize the default AttributeFilter component](../../filters/attribute-filter/#customizing-attributefilter-components) or implement your own, use [`useAttributeFilterController`](../../filters/use-attribute-filter-controller/).

-   To **render a date filter** using your custom component, the date filters customization API (`filters().date()`) provides the `withCustomProvider()` method. It works in the same way as the attribute filter method.

## Event handler API

The event handler API is an entry point to the event handling and subscription subsystem of the Dashboard component.
The Dashboard component is designed to be fully observable via events, and you can register handlers for any of these events.

{{% alert color="warning" title="Most events are beta or alpha" %}}
Most of the events are `@beta` and some are `@alpha`, so they may change in a future version of GoodData.UI and
break your plugin when you upgrade. Check the maturity annotation of each event in the API reference.
{{% /alert %}}

The [event handler API]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardeventhandling.md" >}}) has several methods
that can be divided into the following groups:

-   [`addEventHandler()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardeventhandling.addeventhandler.md" >}}) and [`removeEventHandler()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardeventhandling.removeeventhandler.md" >}})

    These are convenience methods that allow you to add or remove event handlers for a single type of the event or
    for all events. You can specify a particular event type such as `"GDC.DASH/EVT.INITIALIZED"`, and add a function to
    receive the event; or, you can specify an event type as `"*"`, and add a function to receive events of all types.

    For more information, see the API reference for the event handler API.

-   [`addCustomEventHandler()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardeventhandling.addcustomeventhandler.md" >}}) and [`removeCustomEventHandler()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardeventhandling.removecustomeventhandler.md" >}})

    These methods allow you to customize the event handling setup. For each custom event handler,
    you can specify a function to evaluate whether the event should be dispatched to the handler function.

    For more information, see the API reference for the event handler API.

-   [`subscribeToStateChanges()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardeventhandling.subscribetostatechanges.md" >}}) and [`unsubscribeFromStateChanges()`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.idashboardeventhandling.unsubscribefromstatechanges.md" >}})

    In more advanced use cases, your non-React code may need to `select` data from the Dashboard component's state using
    selectors. To do that, your code needs the latest version of the Dashboard component's state. Using
    these methods, you can subscribe to receive the state updates.

    You need to subscribe to the state changes only if code outside of React components and outside
    of the event handlers needs to `select` from the state. When in React components, you can use the `useDashboardSelector`
    to `select` from the state.

## Interacting with the Dashboard component APIs

The Dashboard component APIs are described in the API reference. This section describes how code in your plugin can access those APIs.

The way to interact with the Dashboard component's APIs depends on from where you want to do so.

### Using the APIs from React components

Your custom React components are mounted right into the dashboard's React tree from where they can use hooks
to interact with the Redux-based dashboard APIs:

-   The [`useDashboardSelector`](../use-dashboard-selector/) hook reads state through selectors.
-   The [`useDispatchDashboardCommand`](../dashboard/#commands) hook dispatches commands.

{{% alert color="warning" title="Many commands are beta or alpha" %}}
Many commands are beta- or alpha-level APIs and may change in a future release of the Dashboard component.
{{% /alert %}}

### Using the APIs from outside React components

Your custom non-React code may need to read state through selectors or dispatch commands.
Because that code is completely out of any React tree, you need to access these APIs differently.

-   In the **event handler code**, you receive access points to selectors and commands as arguments. Event handler functions have the following arguments:

    -   `event` to handle
    -   The `dashboardDispatch` function to dispatch commands
    -   The `stateSelect` function to evaluate selectors

    `dashboardDispatch` works like the function returned by `useDashboardDispatch`, and `stateSelect` like
    `useDashboardSelector`.

-   In **all other code** that is not connected to the Dashboard component using React or using an event handler, you need to
    use the `subscribeToStateChanges()` method. The callback function that you pass to this method will be triggered
    every time the Dashboard component's state changes. Your function can store this somewhere and
    pass it as input to the selectors. To make the process of accessing the state easier, use the
    [utilities for accessing the state of the Dashboard component from outside](../dashboard/#access-the-state-of-the-dashboard-component-from-outside-the-component).

    Never modify the state to which you subscribe. The only supported way to change the state is to dispatch commands.

## Props

{{% props %}}
