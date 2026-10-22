---
title: useDashboardDispatch
category: Dashboard & plugins
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-dashboard:useDashboardDispatch"
source_files:
  - src/model/react/DashboardStoreProvider.tsx
related_pages:
  - /docs/dashboard-plugins/dashboard
  - /docs/dashboard-plugins/use-dashboard-selector
  - /docs/dashboard-plugins/use-dashboard-event-dispatch
  - /docs/dashboard-plugins/dashboard-events
description: Get the dispatch function of the dashboard store with the alpha useDashboardDispatch hook, or use the public useDispatchDashboardCommand.
type: docs
weight: 40
section: Dashboard & plugins
---

`useDashboardDispatch` returns the Redux `dispatch` function of the dashboard store, so a plugin component can dispatch any dashboard command.

{{% alert color="warning" title="Alpha API" %}}
`useDashboardDispatch` is `@alpha` and may change. To dispatch a command, prefer the public
[`useDispatchDashboardCommand`](../dashboard/#commands) hook.
{{% /alert %}}

## Basic usage

```tsx
import { changeFilterContextSelectionByParams, useDashboardDispatch } from "@gooddata/sdk-ui-dashboard";

export const ClearFiltersButton = () => {
    const dispatch = useDashboardDispatch();

    return (
        <button onClick={() => dispatch(changeFilterContextSelectionByParams({ filters: [], resetOthers: true }))}>
            Clear filters
        </button>
    );
};
```

The same with the public hook:

```tsx
import { changeFilterContextSelectionByParams, useDispatchDashboardCommand } from "@gooddata/sdk-ui-dashboard";

export const ClearFiltersButton = () => {
    const changeFilters = useDispatchDashboardCommand(changeFilterContextSelectionByParams);

    return <button onClick={() => changeFilters({ filters: [], resetOthers: true })}>Clear filters</button>;
};
```

## Return value

`Dispatch<Action>`: the Redux `dispatch` function of the dashboard store. Pass it a command object created by a command creator, such as `changeFilterContextSelectionByParams(...)`.

## Notes

- Call the hook inside a component rendered by the `Dashboard` component, for example a custom widget of a plugin. Outside of the dashboard store there is no store to dispatch to.
- `useDispatchDashboardCommand(commandCreator)` returns a function that takes the creator's arguments and dispatches the command. Use it unless you need to dispatch several kinds of commands through one function.
- For every command you can dispatch, see [All commands](../dashboard/#all-commands). For the events the dashboard emits in response, see [All events](../dashboard-events/#all-events).
