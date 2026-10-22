---
title: useDashboardLoader
category: Integrations / Hooks
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-loaders:useDashboardLoader"
  - "@gooddata/sdk-ui-loaders:DashboardStub"
  - "@gooddata/sdk-ui-loaders:DashboardLoader"
source_files:
  - src/dashboard/useDashboardLoader.ts
  - src/dashboard/DashboardStub.tsx
  - src/dashboard/dashboardLoader.tsx
related_pages:
  - /docs/dashboard-plugins/embed-dashboard-with-plugins
  - /docs/dashboard-plugins/dashboard-plugins
  - /docs/dashboard-plugins/dashboard
  - /docs/integrations/hooks/use-backend
  - /docs/integrations/hooks/use-workspace
description: Load, bootstrap, and tear down a plugin-enhanced dashboard from React, returning status, result, and error state.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 100
section: Integrations
subsection: Hooks
---

`useDashboardLoader` loads a dashboard together with its plugins, runs the plugins' registration, and returns a `DashboardComponent` ready to render. It's the main hook for embedding a plugin-enhanced dashboard in React. For the webpack setup that plugins linked to a dashboard need, and for combining them with your own plugins, see [Embed a dashboard with plugins](../../../dashboard-plugins/embed-dashboard-with-plugins/).

## Basic usage

```tsx
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";

function MyDashboard({ dashboardRef }) {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        // Use "adaptive" with adaptiveLoadOptions to load plugins linked to the dashboard on the backend.
        loadingMode: "staticOnly",
        // See IDashboardLoadOptions for full configuration
    });

    if (status === "loading" || status === "pending") {
        return <div>Loading dashboard...</div>;
    }

    if (status === "error") {
        return <div>Error: {error.message}</div>;
    }

    // result contains the loaded dashboard with plugins applied
    const { DashboardComponent, props } = result;
    return <DashboardComponent {...props} />;
}
```

### Render with DashboardStub

`DashboardStub` wraps `useDashboardLoader` and renders the loading, error, and
success states for you. Use it instead of the hook when you don't need custom
branching on `status` — pass it the same `IDashboardLoadOptions`, plus an
optional `ErrorComponent` and `LoadingComponent`:

```tsx
import { DashboardStub } from "@gooddata/sdk-ui-loaders";

function MyDashboard({ dashboardRef }) {
    return (
        <DashboardStub
            dashboard={dashboardRef}
            loadingMode="staticOnly"
            ErrorComponent={({ message }) => <div>Error: {message}</div>}
            LoadingComponent={() => <div>Loading dashboard...</div>}
        />
    );
}
```

Reach for the hook directly instead when you need to render something other
than the dashboard while it loads (for example, a skeleton laid out around
other page content) or when you need the `result`/`error` values for
something besides rendering.

### Add layout content from a plugin passed through `extraPlugins`

A plugin registered through `extraPlugins` can insert widgets into the
loaded dashboard from its `register` method, using the layout customization
API (`customize.layout().customizeFluidLayout()`):

```tsx
import {
    DashboardPluginV1,
    newCustomWidget,
    newDashboardItem,
    type DashboardContext,
    type IDashboardCustomizer,
} from "@gooddata/sdk-ui-dashboard";
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";

class AddSectionPlugin extends DashboardPluginV1 {
    public readonly author = "acme";
    public readonly displayName = "Add section plugin";
    public readonly version = "1.0";
    public readonly minEngineVersion = "bundled";

    public register(_ctx: DashboardContext, customize: IDashboardCustomizer): void {
        customize.layout().customizeFluidLayout((_layout, layoutCustomizer) => {
            layoutCustomizer.addSectionToPath(
                { sectionIndex: 0 },
                {
                    type: "IDashboardLayoutSection",
                    items: [newDashboardItem(newCustomWidget("myWidget", "myCustomWidget"), 12)],
                },
            );
        });
    }
}

const { status, result } = useDashboardLoader({
    dashboard: dashboardRef,
    loadingMode: "staticOnly",
    extraPlugins: { factory: () => new AddSectionPlugin() },
});
```

### Set initial filters two ways

To change the filters a dashboard opens with, either pass an already loaded
`IDashboard` with a modified `filterContext` as the `dashboard` option, or pass
`overrideDefaultFilters` through `config` at load time:

```tsx
// `dashboard` is an IDashboard you loaded, for example with
// backend.workspace(workspace).dashboards().getDashboard(dashboardRef)
useDashboardLoader({
    dashboard: { ...dashboard, filterContext: withMyFilter(dashboard.filterContext) },
    loadingMode: "staticOnly",
});
```

```tsx
useDashboardLoader({
    dashboard: dashboardRef,
    loadingMode: "staticOnly",
    config: { overrideDefaultFilters: myFilters },
});
```

Passing a modified `IDashboard` changes the stored filter context the dashboard
starts from; passing `config.overrideDefaultFilters` keeps the stored filter
context and applies your filters on top of it on every load, including reloads
triggered by a change in the hook's dependencies.

### Override chrome components on the loaded dashboard

The `DashboardComponent` the loader returns accepts the same customization
props as `<Dashboard />`. Spread `result.props` and override the ones you
need, such as `FilterBarComponent` or `TopBarComponent`:

```tsx
const { DashboardComponent, props } = result;
return <DashboardComponent {...props} FilterBarComponent={CustomFilterBar} TopBarComponent={CustomTopBar} />;
```

See [Dashboard component](../../../dashboard-plugins/dashboard/) for the full
list of overridable components.

### Dispatch dashboard commands from a plugin-provided component

A component a plugin registers (for example, a custom filter provider) runs
inside the loaded dashboard's store context, so it can dispatch commands the
same way any other dashboard-rendered component does. See
[useDispatchDashboardCommand](../../../dashboard-plugins/dashboard/#commands).

### Load a dashboard outside React

The `DashboardLoader` builder class does the same loading without React. Use it
when you need to load a dashboard outside a component, or need more control
over the loading sequence than the hook's options give you:

```tsx
import { DashboardLoader } from "@gooddata/sdk-ui-loaders";

const { DashboardComponent, props } = await DashboardLoader.staticOnly()
    .withBaseProps({ workspace, dashboard: dashboardRef })
    .withEmbeddedPlugins({ factory: () => new MyPlugin() })
    .load();
```

Start the chain with `DashboardLoader.staticOnly()` or
`DashboardLoader.adaptive(adaptiveLoadOptions)`, configure it with
`withBaseProps`, `withEmbeddedPlugins`, `withFilterContext`,
`fromClientWorkspace`, `fromWorkspace`, `forDashboard`, or `onBackend`, then
call `load()` to resolve the same `DashboardLoadResult` the hook's `result`
carries.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `IDashboardLoadOptions` | Load options including the dashboard reference, the loading mode, and the plugin configuration. |

The options that decide how plugins load:

- `loadingMode`: `"adaptive"` (default) loads and bootstraps the plugins linked to the dashboard on the backend and requires `adaptiveLoadOptions`, the Module Federation integration of your bundler; the hook throws an invariant error without them. `"staticOnly"` skips dynamic plugin loading and uses only the plugins in `extraPlugins`, for environments where running remote plugin code isn't acceptable or that don't use Module Federation.
- `extraPlugins`: plugins bundled with your application.
- `allowUnfinishedFeatures`: `"alwaysPrevent"` (default), `"staticOnly"`, or `"alwaysAllow"`; decides whether the dashboard exposes features still in preview.

## Return value

`DashboardLoadStatus`, a `UseCancelablePromiseState<DashboardLoadResult, any>` with:

- `status`: `"pending" | "loading" | "success" | "error"`
- `result`: `DashboardLoadResult` (on success), which holds the loaded `DashboardComponent` and its `props`
- `error`: Error details (on error)

## Notes

- When `dashboard`, `backend`, `workspace`, `filterContextRef`, `config`, `permissions`, `clientWorkspace`, `extraPlugins`, or `loadingMode` change, the hook loads the dashboard again and cancels the load in flight.
- When the component that uses the hook unmounts, the hook calls `onPluginUnload` on each loaded plugin.
- The hook logs the engine version and the plugin list with `console.debug`, which helps when you diagnose plugin registration.
- Pass `backend` and `workspace` as options, or render the hook inside `BackendProvider` and `WorkspaceProvider`.

## Props

{{% props %}}
