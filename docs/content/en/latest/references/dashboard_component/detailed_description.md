---
title: Dashboard Component  Detailed Description
linkTitle: Detailed Description
copyright: (C) 2007-2021 GoodData Corporation
id: dashboard_component
weight: 1
---

> **Some parts of the Dashboard component are still in the beta stage.**
>
> The Dashboard component has a rich set of APIs, but not all of them are stable yet. Carefully read the API
> maturity annotations, and keep in mind that in the future releases we may make breaking changes to the APIs that are on the `alpha` or `beta` level.

The Dashboard component is a highly customizable component that renders dashboards created and saved by KPI Dashboards.

The Dashboard component:

* Allows you to embed a dashboard natively in React (similarly to [InsightView](../../../learn/visualize_data/insightview/) for visualizations)
* Provides mechanisms to allow you to integrate it with the rest of your application
* Allows you to customize the way the dashboard is rendered: you can alter the layout and change the way particular widgets are rendered 

The Dashboard component is built using an architecture resembling the Model-View-Controller pattern:

-  The Model part is implemented with Redux and Redux-Saga. The Model part exposes rich APIs: selectors to get data from
   the component's state, events to describe changes, interactions with the dashboard, and commands to trigger changes.

-  The View and Controller parts are implemented using React components and hooks. The top-level Dashboard component
   also has rich APIs: props to specify a dashboard to render, configuration for rendering, customization of almost
   all view components used on a dashboard, and integration with the eventing.

## Basic usage

```jsx

import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("<dashboard-identifier>");

const EmbeddedReactDashboard = () => {
    return (
        <Dashboard dashboard={dashboardRef} />
    );
};

```

## Props

Similar to any other React component, you can configure the Dashboard component by setting up its props.

The [API reference](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.idashboardprops.html) describes all the props in detail.
Here are the most important props:

### Base props

| Name             | Required? | Type                 | Description                                                                                                                                                                                                                                                                                                                                           |
| :--------------- | :-------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dashboard        | true      | ObjRef or IDashboard | The reference to the dashboard to render, or the loaded dashboard                                                                                                                                                                                                                                                                                     |
| filterContextRef | false     | ObjRef               | The reference to the filter context that should be used instead of the default, built-in filter context. **NOTE:** This property is valid only when you specify the `dashboard` prop by reference. If you specify `dashboard` by value, the component assumes that the value also contains the desired filter context and will use it as is. |
| config           | false     | DashboardConfig      | Configuration that can be used to modify dashboard features, capabilities, and behavior. If not specified, the dashboard will retrieve and use the essential configuration from the backend.                                                                                                                                                      |

### Customizations props

| Name                     | Required? | Type                             | Description                                                                                                                                                                                               |
| :----------------------- | :-------- | :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| customizationFns         | false     | DashboardModelCustomizationFns   | The customization functions. The dashboard component will call out to these functions at different points during its lifetime. To learn more, see documentation for a particular function. |
| InsightComponentProvider | false     | OptionalInsightComponentProvider | The function to obtain a custom component to use for rendering a visualization                                                                                                                   |
| KpiComponentProvider     | false     | OptionalKpiComponentProvider     | The function to obtain a custom component to use for rendering a KPI                                                                                                                        |
| WidgetComponentProvider  | false     | OptionalWidgetComponentProvider  | The function to obtain a custom component to use for rendering either a built-in widget or a custom widget

### Eventing props

| Name                  | Required? | Type                    | Description                                                                                                                                                                 |
| :-------------------- | :-------- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| eventHandlers         | false     | DashboardEventHandler[] | The event handlers to register at the dashboard creation time                                                                                               |
| onEventingInitialized | false     | Function                | The callback that will be called when the dashboard eventing subsystem initializes and a new event can be registered and existing event handlers can be un-registered |
| onStateChange         | false     | Function                | The callback that will be called each time the state changes                                                                                                |

Check the full list of the Dashboard component props [here](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/presentation/dashboard/types.ts).

## Selectors

To obtain the values of the current state of the Dashboard component, use the [`useDashboardSelector`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.usedashboardselector.html) hook with a relevant selector passed to
it (all dashboard selectors start with the `select` prefix). The selectors have cache, so the reference equality of
the returned value should remain the same (unless the value itself changed), which is useful to avoid unnecessary React re-renders.

```jsx
import { useDashboardSelector, selectInsights } from "@gooddata/sdk-ui-dashboard";

const CustomDashboardWidget = () => {
    // Example how to obtain all visualizations stored on the dashboard
    const visualizations = useDashboardSelector(selectInsights);

    return (
        <pre>{JSON.stringify(visualizations, null, 2)}</pre>
    );
}
```

See all available selectors [here](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/model/store/index.ts).

## Commands

Commands are Redux actions that you can dispatch to the Dashboard component to initiate a change of the rendered dashboard.
To dispatch a command, use the [`useDispatchDashboardCommand`](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.usedispatchdashboardcommand.html) hook.
As the Dashboard component handles a command, it emits one or more events describing what has happened.
Typically, at least one event describing the accomplished result will be emitted.

The events emitted during command handling will be sent to all handlers added for the respective event type. To
allow for request-response semantics, each command can specify a custom correlation ID that will be included in
all events emitted during the command processing.

> **IMPORTANT!** The commands are the only valid and supported way to modify a rendered dashboard. You must not alter the
> state of the Dashboard component by directly mutating it because it may lead to undesired behavior and issues.

```jsx
import { changeFiltersSelection, useDispatchDashboardCommand } from "@gooddata/sdk-ui-dashboard";

const CustomDashboardWidget = () => {
    const changeFiltersSelection = useDispatchDashboardCommand(changeFilterContextSelection);
    const correlationId = "triggeredByCustomDashboardWidget";

    return (
        <button
            onClick={() => changeFiltersSelection(updatedFilters, false, correlationId)}
        >
            Change filters
        </button>
    )
}
```

See the [API reference](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.dashboardcommands.html) for all the commands that are part of the public API.

## Events

Events inform you about what happened in the Dashboard component (for example, the filters changed).

The following code sample represents an example of listening to all dashboard events:

```jsx
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { Dashboard, anyEventHandler } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("<dashboard-identifier>");

const EmbeddedReactDashboard = () => {
    return (
        <Dashboard
            dashboard={dashboardRef}
            eventHandlers={[
                anyEventHandler((e) => {
                    console.log("Dashboard event fired:", e);
                }),
            ]}
        />
    );
};
```

See the [API reference](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.dashboardevents.html) for all the events that are part of the public API.

## Configuration

Configuration of a dashboard can influence the available features, look-and-feel, and behavior of the dashboard. To
specify the configuration, use the `config` prop.

All configuration properties are optional. For most of them, the Dashboard component can reliably retrieve values from the Analytical Backend.

| Name        | Required? | Type        | Description                                                                                                                                                                                                                                                                      |
| :---------- | :-------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| locale      | false     | ILocale     | The localization of the visualization. Defaults to the locale set for the current user. For other languages, see the [full list of available localizations](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts). |
| separators  | false     | ISeparators | The number format                                                                                                                                                                   |
| mapboxToken | false     | string      | The map access token to be used by geo pushpin charts                                                                                                                                                     |
| isReadOnly  | false     | boolean     | If set to `true`, the dashboard will be embedded in read-only mode disabling any user interaction that would alter any backend state (disabling creating/changing alerts, creating scheduled emails, and so on)                                                                      |

See all configuration options [here](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/model/types/commonTypes.ts).

## Access the state of the Dashboard component from outside the component

To access the state of the Dashboard component, use the [SingleDashboardStoreAccessor](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/model/store/storeAccessors/SingleDashboardStoreAccessor.ts) class. This class provides the following functions that enable access to the Dashboard component state:

* `getDashboardSelect()` returns a `dashboardSelect` object for the current dashboard.
* `getDashboardDispatch()` returns a `dashboardDispatch` object for the current dashboard.
* `getOnChangeHandler()` returns a function that can be used as the `onStateChange` callback for the current dashboard.
* `clearAccessor()` removes the accessor from the `store` accessor object.
* `isAccessorInitialized()` returns `true` if the accessor is available for the current dashboard; otherwise, returns `false`.

To access more than one dashboard `store` object, use the [DashboardStoreAccessorRepository](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/model/store/storeAccessors/DashboardStoreAccessorRepository.ts) class. This class uses a map where the value is [DashboardStoreAccessor](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/model/store/storeAccessors/DashboardStoreAccessor.ts) for a single dashboard and the key is the dashboard's `ObjRef`.

* `getAccessorsForDashboard(dashboard)` returns an accessor object for a specific dashboard.
* `getDashboardSelectForDashboard(dashboard)` returns a `dashboardSelect` object for a specific dashboard.
* `getDashboardDispatchForDashboard(dashboard)` returns a `dashboardDispatch` object for a specific dashboard.
* `getOnChangeHandlerForDashboard(dashboard)` returns a function that can be used as the `onStateChange` callback.
* `clearAccessorForDashboard(dashboard)` removes accessors from a specific dashboard.
* `clearAllAccessors()` removes all accessors from the repository.
* `isAccessorInitializedForDashboard(dashboard)` returns `true` if the accessor is available for a specific dashboard; otherwise, returns `false`.

For more information, check the [example](https://gdui-examples.herokuapp.com/dashboard/accessor).

If the default implementation of the `DashboardStoreAccessorRepository` class does not cover your specific scenario, you can use `DashboardStoreAccessor` to implement your own accessor repository.
