---
title: Handle dashboard events
category: Dashboard & plugins
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-dashboard:DashboardEventHandler"
  - "@gooddata/sdk-ui-dashboard:IDashboardEventHandling"
  - "@gooddata/sdk-ui-dashboard:DashboardEvents"
  - "@gooddata/sdk-ui-dashboard:DashboardEventType"
  - "@gooddata/sdk-ui-dashboard:ICustomDashboardEvent"
source_files:
  - src/model/eventHandlers/eventHandler.ts
  - src/model/events/index.ts
related_pages:
  - /docs/dashboard-plugins/dashboard
  - /docs/dashboard-plugins/use-dashboard-event-dispatch
  - /docs/dashboard-plugins/use-dashboard-selector
  - /docs/dashboard-plugins/dashboard-plugins-api
  - /docs/dashboard-plugins/develop-your-first-plugin
description: Register typed handlers for Dashboard component events, read state and dispatch commands from a handler, and match commands to events.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 33
section: Dashboard & plugins
---

The `Dashboard` component emits an event for everything that happens inside it: it finished loading, a filter
changed, the user saved, a widget rendered. Register handlers to react to one kind of event, and read state or
dispatch commands from inside them. A `Dashboard` component you render yourself and a dashboard plugin use the same
handler objects; only the registration call differs.

## Write a handler

A `DashboardEventHandler` is a guard plus a callback:

| Field | Type | Purpose |
|-------|------|---------|
| `eval` | `(event) => boolean` | Decides whether the handler runs for this event |
| `handler` | `(event, dispatch, stateSelect) => void` | Runs when `eval` returned `true` |

Every event type has a type guard named `isDashboard*`. Use it as `eval`, and TypeScript narrows `event` inside
`handler` to that event's payload.

```ts
import {
    isDashboardAttributeFilterSelectionChanged,
    type DashboardAttributeFilterSelectionChanged,
    type DashboardEventHandler,
} from "@gooddata/sdk-ui-dashboard";

export const logFilterChanges: DashboardEventHandler<DashboardAttributeFilterSelectionChanged> = {
    eval: isDashboardAttributeFilterSelectionChanged,
    handler: (event) => {
        const { displayForm, attributeElements } = event.payload.filter.attributeFilter;
        // displayForm: ObjRef of the filter, attributeElements: the new selection
    },
};
```

Two helpers build the common shapes for you:

- `singleEventTypeHandler(type, handler)` matches one event type by its string, for example
  `"GDC.DASH/EVT.FILTER_CONTEXT.CHANGED"`. All type strings are listed in `DashboardEventType`.
- `anyDashboardEventHandler(handler)` matches every built-in dashboard event, but not custom events. Use it for
  logging during development.

## Register handlers

### On the Dashboard component

Pass an array to the `eventHandlers` prop. The handlers are registered when the component initializes.

```tsx
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

export function DashboardPage({ dashboard }: { dashboard: string }) {
    return <Dashboard dashboard={dashboard} eventHandlers={[logFilterChanges]} />;
}
```

### In a plugin

The third argument of `register` is an `IDashboardEventHandling`. Use `addEventHandler` with a type string, or
`addCustomEventHandler` with a full handler object when you want a guard.

```ts
import {
    DashboardPluginV1,
    type DashboardContext,
    type DashboardInitialized,
    type IDashboardCustomizer,
    type IDashboardEventHandling,
} from "@gooddata/sdk-ui-dashboard";

export class Plugin extends DashboardPluginV1 {
    public register(_ctx: DashboardContext, _customize: IDashboardCustomizer, handlers: IDashboardEventHandling): void {
        handlers.addEventHandler<DashboardInitialized>("GDC.DASH/EVT.INITIALIZED", (event) => {
            const visualizationCount = event.payload.insights.length;
            // The dashboard is loaded; event.payload also carries dashboard, config, and permissions
        });

        handlers.addCustomEventHandler(logFilterChanges);
    }
}
```

To unregister, call `removeEventHandler` or `removeCustomEventHandler` with the same arguments.

## Read state and dispatch from a handler

The callback receives `dispatch` and `stateSelect` as its second and third arguments. `dispatch` accepts any
dashboard command. `stateSelect` accepts the same selectors as
[useDashboardSelector](../use-dashboard-selector/).

The following handler resets the Product filter whenever the Region filter changes:

```ts
import { areObjRefsEqual, attributeDisplayFormRef } from "@gooddata/sdk-model";
import {
    isDashboardAttributeFilterSelectionChanged,
    resetAttributeFilterSelection,
    selectFilterContextAttributeFilterItemByDisplayForm,
    type DashboardAttributeFilterSelectionChanged,
    type DashboardEventHandler,
} from "@gooddata/sdk-ui-dashboard";
import * as Md from "./catalog.js";

const regionDisplayForm = attributeDisplayFormRef(Md.Region.Default);
const productDisplayForm = attributeDisplayFormRef(Md.Product.Name);

export const resetProductOnRegionChange: DashboardEventHandler<DashboardAttributeFilterSelectionChanged> = {
    eval: isDashboardAttributeFilterSelectionChanged,
    handler: (event, dispatch, stateSelect) => {
        const changedDisplayForm = event.payload.filter.attributeFilter.displayForm;

        if (!areObjRefsEqual(changedDisplayForm, regionDisplayForm)) {
            return;
        }

        const productFilter = stateSelect(selectFilterContextAttributeFilterItemByDisplayForm(productDisplayForm));

        if (productFilter && "attributeFilter" in productFilter && productFilter.attributeFilter.localIdentifier) {
            dispatch(resetAttributeFilterSelection(productFilter.attributeFilter.localIdentifier));
        }
    },
};
```

Commands take a filter's `localIdentifier`, not its display form, so read it from state first. The
`"attributeFilter" in` check narrows the selector's union result to an element-based filter.

## Match a command to its event

Most command factories accept a `correlationId` as their last argument. The events the command produces carry the
same value in `event.correlationId`, so a handler can tell its own commands apart from user actions.

```ts
import {
    changeAttributeFilterSelection,
    isDashboardAttributeFilterSelectionChanged,
    type DashboardAttributeFilterSelectionChanged,
    type DashboardEventHandler,
} from "@gooddata/sdk-ui-dashboard";

const PLUGIN_CORRELATION = "my-plugin/preset";

export function applyPreset(dispatch: (command: unknown) => void, filterLocalId: string): void {
    dispatch(changeAttributeFilterSelection(filterLocalId, { values: ["East"] }, "IN", PLUGIN_CORRELATION));
}

export const onUserFilterChange: DashboardEventHandler<DashboardAttributeFilterSelectionChanged> = {
    eval: isDashboardAttributeFilterSelectionChanged,
    handler: (event) => {
        if (event.correlationId === PLUGIN_CORRELATION) {
            return; // our own change, ignore
        }
        // the user changed the filter
    },
};
```

## Custom events

Plugins can emit their own events. They are `ICustomDashboardEvent` objects with a `type` string of your choosing
and an optional `payload`. Register a handler for them the same way, with `isCustomDashboardEvent` as the guard
and a check on `type`. To emit one from a component, dispatch the `@beta` `triggerEvent` command with
`useDispatchDashboardCommand`; see [useDashboardEventDispatch](../use-dashboard-event-dispatch/).

```ts
import { isCustomDashboardEvent, type DashboardEventHandler, type ICustomDashboardEvent } from "@gooddata/sdk-ui-dashboard";

type RowSelected = ICustomDashboardEvent<{ rowId: string }>;

export const onRowSelected: DashboardEventHandler<RowSelected> = {
    eval: (event) => isCustomDashboardEvent(event) && event.type === "myPlugin.rowSelected",
    handler: (event) => {
        const rowId = event.payload?.rowId;
    },
};
```

## Commonly used events

| Guard | Event type | Payload |
|-------|------------|---------|
| [`isDashboardInitialized`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.isdashboardinitialized.md" >}}) | `GDC.DASH/EVT.INITIALIZED` | `dashboard`, `insights`, `config`, `permissions` |
| [`isDashboardFilterContextChanged`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.isdashboardfiltercontextchanged.md" >}}) | `GDC.DASH/EVT.FILTER_CONTEXT.CHANGED` | `filterContext` with every dashboard filter after the change, `attributeFilterConfigs` |
| [`isDashboardAttributeFilterSelectionChanged`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.isdashboardattributefilterselectionchanged.md" >}}) | `GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED` | `filter`, the changed `IDashboardAttributeFilter` |
| [`isDashboardDateFilterSelectionChanged`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.isdashboarddatefilterselectionchanged.md" >}}) | `GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED` | `filter`, the new `IDashboardDateFilter` (`undefined` for All time), and `dateFilterOptionLocalId` |
| [`isDashboardSaved`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.isdashboardsaved.md" >}}) | `GDC.DASH/EVT.SAVED` | `dashboard`, the saved `IDashboard`, and `newDashboard` |
| [`isDashboardRenderResolved`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.isdashboardrenderresolved.md" >}}) | `GDC.DASH/EVT.RENDER.RESOLVED` | optional `config` of the rendering worker; every widget has rendered, including asynchronous ones |

`isDashboardFilterContextChanged` fires once per change of any filter and carries the whole filter context. Use it
when you need the complete state; use the per-filter events when you only care about one filter.

## All events

Every published built-in event, sorted by event type so the events of one area sit together. The list is
generated from the SDK with each build. The [`DashboardEvents`]({{< relref "/latest/api-reference/sdk-ui-dashboard/sdk-ui-dashboard.dashboardevents.md" >}})
union in the API reference is the same set as a type, plus the `@alpha` events this page leaves out.

{{% dashboard-catalog "event" %}}

## Notes

- Handlers only see events emitted after registration. Handlers from `eventHandlers`, a plugin's `register`, and
  the `onEventingInitialized` callback are in place before `GDC.DASH/EVT.INITIALIZED`. Handlers you add later, for
  example by keeping the `registerEventHandler` function that `onEventingInitialized` receives and calling it after
  the dashboard has loaded, miss it; read the current state with `stateSelect` instead.
- Keep handlers cheap. Every matching event calls them, and a dashboard with many widgets emits many events while
  it loads.
- Command lifecycle guards (`isDashboardCommandFailed`, `isDashboardWidgetExecutionFailed`) are `@beta`. Check the
  maturity badge before you depend on one; see [API maturity](../../integrations/platform/api-maturity/).
- To dispatch commands from a component instead of a handler, use the `useDispatchDashboardCommand` hook; see
  [Dashboard component](../dashboard/#commands).
