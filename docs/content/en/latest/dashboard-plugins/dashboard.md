---
legacy_path: references/dashboard_component/detailed_description
title: Dashboard component
category: Dashboard & plugins
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-dashboard:Dashboard"
  - "@gooddata/sdk-ui-dashboard:IDashboardProps"
source_files:
  - src/presentation/dashboard/Dashboard.tsx
  - src/presentation/dashboard/types.ts
props_interfaces:
  - IDashboardProps
  - IDashboardBaseProps
  - IDashboardExtensionProps
  - IDashboardEventing
  - IDashboardCustomizationProps
  - IDashboardCustomComponentProps
  - IDashboardWidgetsOverlayProps
  - IDashboardThemingProps
related_pages:
  - /docs/integrations/embedding/embed-dashboards
  - /docs/dashboard-plugins/dashboard-events
  - /docs/dashboard-plugins/use-dashboard-selector
  - /docs/dashboard-plugins/customize-widgets
  - /docs/dashboard-plugins/dashboard-performance
type: docs
description: Embed a saved dashboard with Dashboard, read its state through selectors, dispatch commands, handle events, configure behavior, and access its store externally.
weight: 28
section: Dashboard & plugins
aliases:
  - "../references/dashboard_component/detailed_description/"
---

{{% alert color="warning" title="Some parts of the Dashboard component are still in the beta stage" %}}
Not all APIs of the Dashboard component are stable yet. Check the API maturity annotations: APIs on the `alpha`
or `beta` level can have breaking changes in future releases.
{{% /alert %}}

The Dashboard component renders dashboards created and saved in GoodData Cloud or GoodData.CN.

The Dashboard component:

* Allows you to embed a dashboard natively in React (similarly to [InsightView](../../visualisations/insightview/) for visualizations)
* Provides mechanisms to allow you to integrate it with the rest of your application
* Allows you to customize the way the dashboard is rendered: you can alter the layout and change the way particular widgets are rendered

To customize the alert and scheduled email dialogs the dashboard opens — replace them, override one region, decorate
the data they read, or compose them from blocks — see
[Customize the alert and scheduled email dialogs](../customize-automation-dialogs/).

The Dashboard component is built using an architecture resembling the Model-View-Controller pattern:

-  The Model part is implemented with Redux and Redux-Saga. The Model part exposes rich APIs: selectors to get data from
   the component's state, events to describe changes, interactions with the dashboard, and commands to trigger changes.

-  The View and Controller parts are implemented using React components and hooks. The top-level Dashboard component
   also has rich APIs: props to specify a dashboard to render, configuration for rendering, customization of almost
   all view components used on a dashboard, and integration with the eventing.

## Basic usage

```tsx
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("<dashboard-identifier>");

export const EmbeddedReactDashboard = () => {
    return <Dashboard dashboard={dashboardRef} />;
};
```

## Selectors

To obtain the values of the current state of the Dashboard component, use the [`useDashboardSelector`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.usedashboardselector.md" >}}) hook with a relevant selector passed to
it (all dashboard selectors start with the `select` prefix). The selectors have a cache, so the reference equality of
the returned value should remain the same (unless the value itself changed), which is useful to avoid unnecessary React re-renders.

```tsx
import { useDashboardSelector, selectInsights } from "@gooddata/sdk-ui-dashboard";

const CustomDashboardWidget = () => {
    // Example of how to obtain all visualizations stored on the dashboard
    const visualizations = useDashboardSelector(selectInsights);

    return <pre>{JSON.stringify(visualizations, null, 2)}</pre>;
};
```

All selectors are listed in the [API reference]({{< relref "/latest/api-reference/sdk-ui-dashboard" >}}).

For the selectors plugins use most, parameterized selectors, and reading state from event handlers, see [useDashboardSelector](../use-dashboard-selector/).

## Commands

Commands are Redux actions that you can dispatch to the Dashboard component to initiate a change of the rendered dashboard.
To dispatch a command, use the [`useDispatchDashboardCommand`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.usedispatchdashboardcommand.md" >}}) hook.
As the Dashboard component handles a command, it emits one or more events describing what has happened.
Typically, at least one event describing the accomplished result will be emitted.

The events emitted during command handling will be sent to all handlers added for the respective event type. To
allow for request-response semantics, each command can specify a custom correlation ID that will be included in
all events emitted during the command processing.

{{% alert color="warning" title="Change the dashboard only through commands" %}}
The commands are the only valid and supported way to modify a rendered dashboard. You must not alter the
state of the Dashboard component by directly mutating it because it may lead to undesired behavior and issues.
{{% /alert %}}

```tsx
import { idRef, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { changeFilterContextSelectionByParams, useDispatchDashboardCommand } from "@gooddata/sdk-ui-dashboard";

const updatedFilters = [newPositiveAttributeFilter(idRef("<label-id>", "displayForm"), { values: ["West"] })];

export const CustomDashboardWidget = () => {
    const changeFiltersSelection = useDispatchDashboardCommand(changeFilterContextSelectionByParams);
    const correlationId = "triggeredByCustomDashboardWidget";

    return (
        <button
            onClick={() =>
                changeFiltersSelection({ filters: updatedFilters, resetOthers: false, correlationId })
            }
        >
            Change filters
        </button>
    );
};
```

### All commands

Every published command, sorted by command type so the commands of one area sit together. "Create with" lists
the functions that build the command; pass one of them to `useDispatchDashboardCommand`. The list is generated
from the SDK with each build. The [`DashboardCommands`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.dashboardcommands.md" >}})
union in the API reference is the same set as a type, plus the `@alpha` commands this page leaves out.

{{% dashboard-catalog "command" %}}

For the events, see [All events](../dashboard-events/#all-events).

## Events

Events inform you about what happened in the Dashboard component (for example, the filters changed).

This example listens to every event, including custom events. To listen to the built-in dashboard events only, use `anyDashboardEventHandler`.

```tsx
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { Dashboard, anyEventHandler } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("<dashboard-identifier>");

export const EmbeddedReactDashboard = () => {
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

To react to one kind of event with a typed guard, read state inside a handler, or match a command to the event it produces, see [Handle dashboard events](../dashboard-events/). All events are listed in the [API reference]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.dashboardevents.md" >}}).

## Configuration

Configuration of a dashboard can influence the available features, look-and-feel, and behavior of the dashboard. To
specify the configuration, use the `config` prop.

All configuration properties are optional. For most of them, the Dashboard component retrieves the values from the Analytical Backend. The most common ones:

| Name | Type | Description |
| :--- | :--- | :--- |
| `locale` | `ILocale` | The locale of the dashboard. Defaults to the locale set for the current user. For other languages, see the [full list of available localizations](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-model/src/base/localization.ts). |
| `separators` | `ISeparators` | The number separators used by the charts on the dashboard. |
| `mapboxToken` | `string` | The map access token used by geo pushpin charts. |
| `isReadOnly` | `boolean` | If `true`, the dashboard is embedded in read-only mode, which disables any user interaction that would alter backend state (creating or changing alerts, creating scheduled emails, and so on). Defaults to `false`. |
| `enableInsightEditing` | `boolean` | `@alpha`. If `true`, users explore, edit, and create visualizations in Analytical Designer on top of the dashboard. See [Edit visualizations on a dashboard](../edit-visualizations-on-dashboard/). Defaults to `false`. |

All configuration options are in `DashboardConfig`.

## Access the state of the Dashboard component from outside the component

To access the state of the Dashboard component, use the `SingleDashboardStoreAccessor` class. This class provides the following functions that enable access to the Dashboard component state:

* `getDashboardSelect()` returns a `dashboardSelect` object for the current dashboard.
* `getDashboardDispatch()` returns a `dashboardDispatch` object for the current dashboard.
* `getOnChangeHandler()` returns a function that can be used as the `onStateChange` callback for the current dashboard.
* `clearAccessor()` removes the accessor from the `store` accessor object.
* `isAccessorInitialized()` returns `true` if the accessor is available for the current dashboard; otherwise, returns `false`.

To access more than one dashboard `store` object, use the `DashboardStoreAccessorRepository` class. This class uses a map where the value is a `DashboardStoreAccessor` for a single dashboard and the key is the dashboard's `ObjRef`.

* `getAccessorsForDashboard(dashboard)` returns an accessor object for a specific dashboard.
* `getDashboardSelectForDashboard(dashboard)` returns a `dashboardSelect` object for a specific dashboard.
* `getDashboardDispatchForDashboard(dashboard)` returns a `dashboardDispatch` object for a specific dashboard.
* `getOnChangeHandlerForDashboard(dashboard)` returns a function that can be used as the `onStateChange` callback.
* `clearAccessorForDashboard(dashboard)` removes accessors from a specific dashboard.
* `clearAllAccessors()` removes all accessors from the repository.
* `isAccessorInitializedForDashboard(dashboard)` returns `true` if the accessor is available for a specific dashboard; otherwise, returns `false`.

For more information, check the [example](https://gdui-examples.herokuapp.com/dashboard/accessor).

If the default implementation of the `DashboardStoreAccessorRepository` class does not cover your specific scenario, you can use `DashboardStoreAccessor` to implement your own accessor repository.

## Props

{{% props %}}
