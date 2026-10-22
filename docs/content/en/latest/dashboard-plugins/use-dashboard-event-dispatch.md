---
title: useDashboardEventDispatch
category: Dashboard & plugins
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-dashboard:useDashboardEventDispatch"
source_files:
  - src/model/react/useDashboardEventDispatch.ts
related_pages:
  - /docs/dashboard-plugins/dashboard-events
  - /docs/dashboard-plugins/use-dashboard-dispatch
  - /docs/dashboard-plugins/dashboard
description: Dispatch built-in or custom dashboard events from a plugin component with the alpha useDashboardEventDispatch hook.
type: docs
weight: 41
section: Dashboard & plugins
---

`useDashboardEventDispatch` returns a function that sends a built-in or custom event to the dashboard event bus from a plugin component.

{{% alert color="warning" title="Alpha API" %}}
`useDashboardEventDispatch` is `@alpha` and may change. For a public alternative, dispatch the `@beta` `triggerEvent`
command through the public [`useDispatchDashboardCommand`](../dashboard/#commands) hook:
`useDispatchDashboardCommand(triggerEvent)`.
{{% /alert %}}

## Basic usage

```tsx
import { useDashboardEventDispatch } from "@gooddata/sdk-ui-dashboard";

export const NotifyButton = () => {
    const dispatchEvent = useDashboardEventDispatch();

    return (
        <button onClick={() => dispatchEvent({ type: "CUSTOM/EVT/MY_WIDGET_CLICKED", payload: { source: "notify" } })}>
            Notify
        </button>
    );
};
```

Handle the event like any other, for example with a custom event handler in a plugin; see [Handle dashboard events](../dashboard-events/).

## Return value

`(eventBody: DashboardEventBody<DashboardEvents | ICustomDashboardEvent>) => void`: a function that wraps the event in the `triggerEvent` command and dispatches it. `DashboardEventBody` is the event without its `ctx`; the dashboard adds the context.

## Notes

- The event `type` must start with `GDC.DASH/EVT` (a built-in event) or `CUSTOM/EVT` (a custom event). Any other value fails an invariant: "Unsupported event passed to useDashboardEventDispatch result."
- Call the hook inside a component rendered by the `Dashboard` component.
