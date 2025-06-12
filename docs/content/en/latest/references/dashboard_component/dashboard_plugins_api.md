---
title: Dashboard Plugin API
sidebar_label: Dashboard Plugin API
copyright: (C) 2007-2021 GoodData Corporation
id: dashboard_plugins_api
---

Your plugin can take advantage of several categories of APIs that are outlined in this article.

All the public and most of the beta-level APIs have detailed documentation in form of TSDoc. We generate the API
doc website from these comments. You can find the API reference [here](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.html).

## Plugin contract

The plugin contract is the first API that you will come in touch with. The contract defines properties that you need
to fill in and functions to implement, including the functions that allow you to specify code
to run on load, during registration, and after unload.

A new plugin that is bootstrapped using the Plugin Development Toolkit sets up
all the contract essentials and provides a template implementation of some of the functions by subclassing
the `DashboardPluginV1`.

You can modify your subclass as needed. You can even add a plugin-specific internal state into this class, if needed.

### onPluginLoaded

When implemented, this function is called right after your plugin is loaded and is about to be used on a dashboard.
At this point, your code receives information about the context in which it will operate. Most notably:

-   The Analytical Backend that is currently in use
-   The workspace that the user works with
-   The reference of the dashboard that is about to be loaded
-   The Analytical Backend setup authenticated and ready to use in case your plugin needs to read additional data from the backend

This function may return a promise. In that case, the dashboard loader waits until the promise is resolved and
then proceeds. The loader does not impose any timeout on the `onPluginLoaded` call. If you make calls over the network,
a good practice is to consider potential failures and include timeouts and necessary fallbacks.

**NOTE:** If your implementation of this function fails with an exception, the loader excludes your plugin from further processing.

#### Parameterization

To allow a plugin to be reused across dashboards, you can make each link between a dashboard and your plugin specify
additional parameters. These parameters can then be used to customize the behavior of the plugin for
a particular dashboard.

GoodData treats parameters opaquely. Only soft-size limits of 2,048 bytes for
the length of the parameter string are imposed. Otherwise, the parameters are fully under your control and responsibility.

If the parameters are specified on the link between a dashboard and your plugin, the loader sends them as the
second argument to the `onPluginLoad` function.

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
API is described in detail in the [API reference](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardcustomizer.html).

### Customize rendering of visualizations

Call the `insightWidgets()` method on the customization API to get to the API through which you can customize
how the [visualization widgets](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardinsightcustomizer.html)
on your dashboard will be rendered.

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
        using custom components, use tags. You can assign arbitrary tags to your insight objects and then use this
        method to register a renderer for the visualization widgets that have this tag.

        To learn how to tag visualizations, see the GoodData Cloud API documentation.

-   To **add additional elements on top of the visualization widgets** that are rendered using the built-in renderers, the visualization widget customization API provides
    a method to register a "decorator" called `withCustomDecorator()`.

    In some way, the decorators resemble a concept of middleware that you may be familiar with from `express` or `redux`. Instead of
    registering a function that evaluates the widget and visualization and returns a React component, for decorators you have to
    register a factory function. This factory function receives a provider for the component to decorate
    and must then return a function to provide a decorator component. The function to return has the same signature as
    the visualization provider function that you register in `withCustomProvider`.

    This is best described in code:

    ```javascript
    withCustomDecorator((next) => {
        return (insight, widget) => {
            if (some_condition_to_prevent_decoration) {
                return undefined;
            }

            // Make sure you call this outside the component render function,
            // otherwise a new instance of the decorated component is created on each re-render.
            const Decorated = next(insight, widget);

            function MyCustomDecorator(props) {
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
    ```

### Use custom widgets

With custom widgets, you can enrich dashboards with arbitrary content. For example, your dashboard can use
a built-in visualization and widget renderers and then use the custom widgets to add extra content such as images,
additional text, or forms.

Your must first register a custom widget type, which is declaration of the custom widget type. The declaration links the custom widget type name and the React component to use for rendering.

Once you have registered the custom widget type, you can add any number of widgets of this type to your dashboard using the layout manipulation API.

**NOTE:** The default plugin bootstrapped by the Plugin Development Toolkit defines a sample custom widget
that you can try out right away.

#### Register types of custom widgets

Call the `customWidgets()` method on the customization API to get to the API through which you can
register [custom widget types](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardwidgetcustomizer.html).

Use the `addCustomWidget()` method to register a custom widget type and provide your custom React component. The
props for this component will be of the `IDashboardWidgetProps` type. The `widget` property contains a payload
for the custom widget.

#### Add custom widgets to a dashboard

Once you have a custom widget type registered, you can add instances of the widgets of this type to a dashboard. To do so,
use the layout manipulation API.

Call the `layout()` method on the customization API to get to the API through which you can
[customize the layout](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardlayoutcustomizer.html).
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

-   [The fluid layout customization API](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.ifluidlayoutcustomizer.html)

    This API allows you to add new sections (rows) to a dashboard or add new items (columns) to existing
    sections.

**NOTE:** The function that you register at this point will be called once during the dashboard initialization to modify
the layout before it is stored in the Dashboard component's state. This API does not support further modifications of the layout that is
already rendered. The Dashboard component provides alpha-level APIs that can be used to add, move, or remove widgets once the Dashboard component is rendered.

#### Create sections, items, and custom widgets

We do not recommend that you create sections, items, and custom widget objects manually. The Dashboard component
contains convenient factory functions to create these objects:

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

-   [`useCustomWidgetExecutionDataView()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.usecustomwidgetexecutiondataview.html) allows you to get data for free-form execution in the context of the widget.
-   [`useCustomWidgetInsightDataView()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.usecustomwidgetinsightdataview.html) allows you to get data for a specific visualization in the context of the widget.

By default, the data computation respects the filters set on the dashboard. If you want a custom widget to ignore some filters during the data computation, set it up when creating the widget using the `newCustomWidget()` function:

```javascript
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import { newCustomWidget } from "@gooddata/sdk-ui-dashboard";

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
}),
```

#### Trigger commands from a custom widget

To interact with the dashboard from within a custom widget, dispatch commands from the Model Command API.

#### Prepare custom widget for PDF exports

If you are loading some asynchronous data for your custom widget / visualization (either via the [hooks mentioned above](#calculate-data-for-a-custom-widget) or your own HTTP requests),
then you must inform the dashboard via the `useDashboardAsyncRender` hook to ensure that the widget renders correctly during the export to PDF.
Please note that it may take up to 20 minutes for additional data to load. After this time, the dashboard will be exported anyway.
The following example demonstrates how to do it with a custom visualization widget.

```javascript
import React from "react";
import { LoadingComponent, ErrorComponent } from "@gooddata/sdk-ui";
import {
    IDashboardInsightProps,
    useDashboardAsyncRender,
    useInsightWidgetDataView,
} from "@gooddata/sdk-ui-dashboard";

function MyCustomInsight(props: IDashboardInsightProps): JSX.Element {
    // Note that the "myCustomWidget" identifier must be unique for each single rendered component
    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender("myCustomWidget");

    const { result, status } = useInsightWidgetDataView({
        insightWidget: props.widget,
        onLoading: () => {
            // Register widget for asynchronous rendering
            onRequestAsyncRender();
        },
        onSuccess: () => {
            // Inform the dashboard, that the widget is rendered
            onResolveAsyncRender()
        },
        onError: () => {
            // Inform the dashboard, that the widget is rendered
            onResolveAsyncRender();
        }
    })

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />
    }

    if (status === "error") {
        return <ErrorComponent />
    }

    return (
        // Do something with the data
        <pre>
            {JSON.stringify(result!.data().series().toArray(), null, 4)}
        </pre>
    )
}

```

This mechanism is important not only for exports, but also to ensure that the `GDC.DASH/EVT.RENDER.RESOLVED` event is fired at the right time (after the dashboard is fully rendered).

---

To utilize GoodData.UI charts within your personalized widgets, it's reccommended to make them compatible with PDF Export functionality.

Example usage:

```javascript
import React from "react";
import {
    IDashboardInsightProps,
    useDashboardAsyncRender,
    useInsightWidgetDataView,
    useDashboardSelector,
    selectIsExport,
    selectIsInExportMode,
} from "@gooddata/sdk-ui-dashboard";

function MyCustomInsight(props: IDashboardInsightProps): JSX.Element {
    // Note that the "myCustomWidget" identifier must be unique for each single rendered component
    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender("myCustomWidget");
    const isExportSnapshotMode = useDashboardSelector(selectIsExport);
    const isExportSlidesMode = useDashboardSelector(selectIsInExportMode);

    return (
        <InsightView
            insight="<your-visualization-id>"
            onLoadingChanged={({ isLoading }) => {
                if (isLoading) {
                    onRequestAsyncRender();
                } else {
                    onResolveAsyncRender();
                }
            }}
            onError={() => {
                onResolveAsyncRender();
            }}
            config={{
                // Be sure to specify this in the chart config,
                // otherwise some charts may not be rendered.
                isExportMode: isExportSnapshotMode || isExportSlidesMode,
            }}
        />
    );
}
```

It can be advantageous to render your custom chart differently during the export mode.

You can utilize isExportSnapshotMode or isExportSlidesMode to determine the rendering mode.

Example usage:

```javascript
import React from "react";
import {
    IDashboardInsightProps,
    useDashboardSelector,
    selectIsExport,
    selectIsInExportMode,
} from "@gooddata/sdk-ui-dashboard";

function MyCustomInsight(props: IDashboardInsightProps): JSX.Element {
    const isExportSnapshotMode = useDashboardSelector(selectIsExport);
    const isExportSlidesMode = useDashboardSelector(selectIsInExportMode);

    if (isExportSnapshotMode) {
        return (
            // Code to render the chart in the PDF export
        )
    }

    if (isExportSlidesMode) {
        return (
            // Code to render the chart in the slides export
        )
    }

    return (
        // Code to render the chart in a common way
    )
}

```

#### Snapshot and Slides export

As in example above, you can see that are are two modes of export: Snapshot and Slides. The snapshot export is the one that is used when you export the dashboard to PDF as it. This mode basically create a snapshot of the entire dashboard and export it into PDF. The Slides export is used when you export the dashboard to presentation like format. That mean whole dashboard is decomposed into slides like representation and than ix exported into desired slides format (PDF, PPTX, etc.).

It's important to note that export functionality does not capture a screenshot of the current dashboard. Rather, it reloads the entire dashboard in the background.

Therefore, if you plan to incorporate any interactive features in your custom widget, keep in mind that any changes may not appear in the export.

You may need to implement your own logic to ensure the widget renders correctly during the export process.

### Slides export customizer

The slides export customizer API allows you to customize the slides export process. You can use this API to add custom slides to the export or change default behaviour of decomposing containers, visualisation switchers and break up slides.

Call the `layout()` method on the customization API to get to the API through which you can
[customize the export slides layout](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardlayoutcustomizer.html).
To be prepared for different types of export layouts that may be implemented in the future, the layout manipulation API contains methods to customize the layout of a particular type. To customize this export layout, use
the `customizeExportLayout()` function to register your customization function.

You have to implement the export layout customization function yourself. This function is called with
the following parameters:

-   The layout as currently defined on the dashboard

    The layout is provided so that your code can inspect the layout and determine what and where
    to customize if needed. Depending on your use case, you may or may not need to inspect the layout. For instance, if you
    are adding a custom header on top of the dashboard, you can just do that.

-   [The export layout customization API](https://sdk.gooddata.com/gooddata-ui-apidocs/v10.23.0/docs/sdk-ui-dashboard.iexportlayoutcustomizer.html)

    This API allows you to change a way how export decompose layout into slides.

Default usage:

```javascript
import React from "react";
import {
    IDashboardInsightProps,
    useDashboardSelector,
    selectIsExport,
    selectIsInExportMode,
} from "@gooddata/sdk-ui-dashboard";

export class Plugin extends DashboardPluginV1 {

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        customize.layout().customizeExportLayout((_layout, customizer) => {
            customizer.addTransformer((section, { defaultSection }) => {
                return compact([defaultSection(section)].flat());
            });
        });
    }

}

```

This is default behaviour of the export layout customizer. It will decompose the layout into slides and add a transformer to each section. The transformer will be called for each section and it will return a new section with the default behaviour. If you not register any transformer, the default behaviour will be used, but if you register a transformer, it will be called for each section and it will return a new section with the default behaviour. So use this if you want to keep the default behaviour, but you want to add some custom behaviour to the transformer.

There are also several other transformers and helper functions that you can use to customize the export layout. The following functions are available:

Default transformers:

-   `defaultItems()` - Default transformer for the items. This is used as default transformation method for the items in section in case that no plugin override it. Can be used to provide default transformation for the items in custom plugin.
-   `defaultSection()` - Default transformer for the section. This is used as default transformation method for the section in case that no plugin override it. Can be used to provide default transformation for the section in custom plugin.

Helper transformers:

-   `breakUpSlide()` - This transformer ís used to extract break up slide from current section. Break up slide is created from section title and description. This transformer only create slide when section has title or description.
-   `containerSlide()` - This is more complex transformer that is used to transform whole dashboard container item in the layout to a slide. Container item is transformed as a **structured slide**, but if it contains a **visualization switcher**, it is decomposed to a flat list of visualizations that are part of container item including decomposing all visualization switcher items.
-   `containerSwitcherSlide()` - This is more complex transformer that is used to transform whole dashboard container item in the layout to a slide. Container item is transformed as a **structured slide**, but if it contains a visualization switcher, switcher is spread into multiple whole slides where each slide contains one visualization from each switcher in container, but others visualization will be same in all slides.
-   `itemsSlide()` - This is helper function that is used to iterate all items in the section. On every item it calls provided transform function. This function is used to transform all items in the section.
-   `switcherSlide()` - This transformer is used to create multiple slides from visualization switcher widget. Each slide contains one visualization that is part of the visualization switcher.
-   `widgetSlide()` - This transformer is used to extract widget slide from current section and provided item. Widget slide is created from provided item. Widget slide always contains only one item that mean there will be one item on created slide.

Functions that are used to determine if the section contains something:

-   `containsVisualisationSwitcher()` - This function is used to determine if the section contains visualization switcher.

> Keep on mind that with combination of Custom components its necessary to add some specific data attributes that are used by exporter to dashboard structure. Normally its not necessary to add any data attributes, because we are wrapping components into these attributes, but in case of customization whole layout it needs to be included.

For these cases, we provided hooks that will give you desired attributes and its necessary to add them to your custom component.

-   `useDashboardExportData()`
-   `useSectionExportData()`
-   `useWidgetExportData()`
-   `useRichTextExportData()`
-   `useVisualizationExportData()`
-   `useMetaExportData()`
-   `useMetaExportImageData()`
-   `useMetaPaletteData()`

### Customize the Filter bar

Call the `filterBar()` method on the customization API to get the API through which you can customize how the Filter bar will be rendered on your dashboard.

To change the rendering mode of the Filter bar, call the `setRenderingMode` method with one of the following parameters:

-   `"default"` shows the Filter bar as usual. This is equal to when you do not call the `setRenderingMode` method at all.
-   `"hidden"` hides the Filter bar.

    **NOTE:** This only hides the Filter bar from the user interface. Any set filters will still be applied.

### Customize Attribute Filters and Date Filter

Call the `filters()` method on the customization API to get the API through which you can customize how the attribute or date filters will be rendered on your dashboard.

-   To **render one or more attribute filters** using your custom components, the attribute filters customization API provides the `withCustomProvider()` method [similar to visualization widgets](#customize-rendering-of-insights).

    When calling this method, you can register a function that will be called by the Dashboard component every time it
    wants to render an attribute filter. The function will receive a filter definition to be rendered. This function
    is expected to return a React component to use for rendering that attribute filter. If the function does not return
    a custom component, the Dashboard component falls back and uses the built-in component.

    Your function must determine that a particular attribute filter should be rendered using
    a custom component and then return the custom component. How your function determines this is up to you.

    **TIP:** GoodData.UI contains API that will help you to customize the default AttributeFilter component or implement your own.

-   To **render a date filter** using your custom component, the date filter customization API provides the `withCustomProvider()` method. It works in the same way as the attribute filter method.

## Event handler API

The event handler API is an entry point to the event handling and subscription subsystem of the Dashboard component.
The Dashboard component is designed to be fully observable via events, and you can register handlers for any of these events.

**NOTE:** Keep in mind that the API maturity of most of the events is `@alpha`. That means that they may change in one of the future
versions of GoodData.UI and break your plugin if you try to upgrade to it.

The [event handler API](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardeventhandling.html) has several methods
that can be divided into the following groups:

-   [`addEventHandler()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardeventhandling.addcustomeventhandler.html) and [`removeEventHandler()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardeventhandling.removecustomeventhandler.html)

    These are convenience methods that allow you to add or remove event handlers for a single type of the event or
    for all events. You can specify a particular event type such as `"GDC.DASH/EVT.INITIALIZED"`, and add a function to
    receive the event; or, you can specify an event type as `"*"`, and add a function to receive events of all types.

    For more information, see the API reference for the event handler API.

-   [`addCustomEventHandler()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardeventhandling.addcustomeventhandler.html) and [`removeCustomEventHandler()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardeventhandling.removecustomeventhandler.html)

    These methods allow you to customize the event handling setup. For each custom event handler,
    you can specify a function to evaluate whether the event should be dispatched to the handler function.

    For more information, see the API reference for the event handler API.

-   [`subscribeToStateChanges()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardeventhandling.subscribetostatechanges.html) and [`unsubscribeFromStateChanges()`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardeventhandling.unsubscribefromstatechanges.html)

    In more advanced use cases, your non-React code may need to `select` data from the Dashboard component's state using the
    Model Selector APIs. To do that, your code needs the latest version of the Dashboard component's state. Using
    these methods, you can subscribe to receive the state updates.

    **NOTE:** You need to subscribe to receive the state changes only if you have code outside of React components and outside
    of the event handlers that need to `select` from the state. When in React components, you can use the `useDashboardSelector`
    to `select` from the state.

## Interacting with the Dashboard component APIs

The Dashboard component APIs are described in the API reference. This section describes how code in your plugin can access those APIs.

The way to interact with the Dashboard component's APIs depends on from where you want to do so.

### Using the APIs from React components

Your custom React components are mounted right into the dashboard's React tree from where they can use hooks
to interact with the Redux-based dashboard APIs:

-   The [`useDashboardSelector`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.usedashboardselector.html) hook helps interact with the Model Selector API.
-   The [`useDispatchDashboardCommand`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.usedispatchdashboardcommand.html) hook helps dispatch actions from the Model Command API.

**NOTE:** Many actions in the Model Command API are alpha-level APIs and will most likely change in one of the
future releases of the Dashboard component.

### Using the APIs from outside React components

Your custom non-React code may need to use the Model Selector API or dispatch actions from the Model Command API.
Because that code is completely out of any React tree, you need to access these APIs differently.

-   In the **event handler code**, you receive access points to the Model APIs as arguments. Event handler functions have the following arguments:

    -   `event` to handle
    -   The `dashboardDispatch` function to dispatch actions from the Model Command API
    -   The `stateSelect` function to use for accessing the Model Selector API

    The `dashboardDispatch` and `stateSelect` semantics are the same as with the `useDashboardDispatch` and
    `useDashboardSelector` hooks.

-   In **all other code** that is not connected to the Dashboard component using React or using an event handler, you need to
    use the `subscribeToStateChanges()` method. The callback function that you pass to this method will be triggered
    every time the Dashboard component's state changes. Your function can store this somewhere and
    pass it as input to the selectors. To make the process of accessing the state easier, use the utilities for accessing the state of the Dashboard component from outside.

    > **IMPORTANT!** Never modify the state to which you subscribe. GoodData.UI does not support this action. The only supported way to modify the state is through the Model Command API.
