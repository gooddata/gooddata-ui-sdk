---
title: Dashboard and visualization embed elements
linkTitle: "Embed elements"
category: Integrations / Web Components
diataxis_type: reference
source_files:
  - src/visualizations/DashboardEmbed.tsx
  - src/visualizations/InsightEmbed.tsx
  - src/visualizations/internal/DashboardLoaderBridge.tsx
  - src/common/CustomElementAdapter.ts
related_pages:
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/web-components/dashboard-custom-element
  - /docs/integrations/web-components/insight-custom-element
  - /docs/integrations/web-components/web-components-auth
description: Embed a dashboard or a saved visualization with gd-dashboard-embed and gd-insight-embed, and drive them through properties, methods, and events.
type: docs
weight: 81
section: Integrations
subsection: Web Components
---

`gd-dashboard-embed` and `gd-insight-embed` are the recommended custom elements for new integrations. They render the same React components as the legacy `gd-dashboard` and `gd-insight` elements, the `Dashboard` component and [`InsightView`](../../../visualisations/insightview/), and add JavaScript properties, methods, lifecycle events, and dashboard plugin loading. The legacy elements stay registered for existing integrations; see the [dashboard](../dashboard-custom-element/) and [visualization](../insight-custom-element/) pages.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

## Embed elements compared with the legacy elements

| | `gd-dashboard-embed`, `gd-insight-embed` | `gd-dashboard`, `gd-insight` |
| --- | --- | --- |
| Inputs | Attributes for the initial setup, JavaScript properties for everything after | Attributes only |
| `dashboard` / `insight` identity | Locked after the first render; a change dispatches `gd-error` | Any attribute change re-renders, including the identity |
| Methods | `refresh()`; `replaceFilters()` on the dashboard | None |
| Lifecycle events | `gd-ready`, `gd-error`; `gd-warning` on the dashboard | None; load failures go to `console.error` |
| Dashboard plugins | Loaded, controlled by `pluginMode` | Not loaded |
| Backend and workspace | The shared context, or a per-element `context` property | The shared context and the `workspace` attribute |

## Minimal example

```html
<script type="module" src="https://example.gooddata.com/components/my-workspace-id.js?auth=sso"></script>

<gd-dashboard-embed dashboard="my-dashboard-id"></gd-dashboard-embed>

<gd-insight-embed insight="my-visualization-id" title style="display: block; height: 500px"></gd-insight-embed>
```

Load the library and sign the user in as described in the [Web Components overview](../web-components-overview/) and [Web Components authentication](../web-components-auth/).

## How inputs resolve

Both elements follow the same rules:

- **Attributes bootstrap, properties drive.** An attribute is read at render time. Once you assign the JavaScript property of the same name, the property wins over the attribute, even when you assign `undefined`.
- **Changes are batched.** Several property assignments or attribute changes in the same task cause one re-render.
- **Identity is immutable.** After the first successful render, `dashboard` (or `insight`) can't change through the attribute or the property. The element dispatches `gd-error` with `phase: "invalidUsage"` and the message `"dashboard" cannot change after first render.`, and keeps rendering the original object. To show a different dashboard or visualization, mount a new element.
- **Context merges field by field.** The `context` property `{ backend, workspaceId?, mapboxToken?, agGridToken? }` overrides the shared context set from the script URL or with [`setContext`](../web-components-auth/). The workspace resolves as `context.workspaceId`, then the `workspace` attribute, then the shared context.
- **Loading state.** Until a backend is known and the component code has loaded, the element renders the `LoadingComponent` from `@gooddata/sdk-ui`. If either fails, it dispatches `gd-error` with `phase: "init"`.
- **Disconnecting unmounts.** Removing the element from the DOM unmounts its React tree. Reconnecting renders it again with the same, still locked, identity.

## `gd-dashboard-embed`

Loads the dashboard through the same loader as the [`useDashboardLoader`](../../hooks/use-dashboard-loader/) hook and renders the `Dashboard` component.

### Attributes

| Attribute | Value | Description |
| --- | --- | --- |
| `dashboard` | Dashboard ID | Required unless you set the `dashboard` property. Locked after the first render. |
| `workspace` | Workspace ID | Overrides the workspace of the shared context. |
| `locale` | Locale code such as `en-US` | Sets `config.locale`. Ignored once you assign the `config` property. |
| `readonly` | Boolean attribute | Sets `config.isReadOnly: true`. Ignored once you assign the `config` property. |
| `mapbox` | Mapbox access token | Sets `config.mapboxToken`; overrides `mapboxToken` from the context. Ignored once you assign the `config` property. |
| `agGrid` | AG Grid license key | Sets `config.agGridToken`; overrides `agGridToken` from the context. Ignored once you assign the `config` property. |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `context` | `{ backend, workspaceId?, mapboxToken?, agGridToken? }` | Per-element backend and workspace. Missing fields fall back to the shared context. |
| `config` | `DashboardConfig` | The complete `config` prop of the `Dashboard` component. Replaces the config built from the attributes and the context tokens, so include `locale`, `isReadOnly`, `mapboxToken`, and `agGridToken` yourself when you need them. |
| `dashboard` | `string` | Dashboard ID. Same identity rule as the attribute. |
| `pluginMode` | `"all" \| "embeddedOnly" \| "backendOnly" \| "disabled"` | Which dashboard plugins load. See [Dashboard plugins](#dashboard-plugins). |
| `extraPlugins` | `IEmbeddedPlugin \| IEmbeddedPlugin[]` | Plugins bundled with your application. |
| `moduleFederationIntegration` | `ModuleFederationIntegration` | Module Federation runtime needed to load plugins linked to the dashboard on the server. |

### Dashboard plugins

Unlike `gd-dashboard`, the embed element loads [dashboard plugins](../../../dashboard-plugins/dashboard-plugins/). `pluginMode` selects which ones:

| `pluginMode` | Plugins linked on the server | `extraPlugins` | Needs `moduleFederationIntegration` |
| --- | --- | --- | --- |
| Not set | Loaded when `moduleFederationIntegration` is set; otherwise skipped with a `gd-warning` | Loaded | No |
| `"all"` | Loaded | Loaded | Yes; otherwise `gd-error` with `phase: "init"` and the dashboard doesn't render |
| `"embeddedOnly"` | Skipped; a `gd-warning` is dispatched when the dashboard has any | Loaded | No |
| `"backendOnly"` | Loaded | Ignored, with a `gd-warning` | Yes; otherwise `gd-error` with `phase: "init"` |
| `"disabled"` | Skipped | Ignored, with a `gd-warning` | No |

Set `pluginMode = "disabled"` to keep the no-plugin behavior of `gd-dashboard` without the warning.

### Methods

| Method | Description |
| --- | --- |
| `refresh(): Promise<void>` | Re-initializes the dashboard with the current `config` by dispatching the `initializeDashboard` command. Resolves on `GDC.DASH/EVT.INITIALIZED`; rejects, and dispatches `gd-error` with `phase: "refresh"`, on `GDC.DASH/EVT.COMMAND.FAILED`. |
| `replaceFilters(filters: (IDashboardFilter \| FilterContextItem)[]): Promise<void>` | Replaces the filter selection by dispatching `changeFilterContextSelection(filters, true)`; filters you leave out are reset. Resolves on `GDC.DASH/EVT.FILTER_CONTEXT.CHANGED`; rejects, and dispatches `gd-error` with `phase: "replaceFilters"`, on `GDC.DASH/EVT.COMMAND.FAILED`. This is the Web Components counterpart of the `setFilterContext` postMessage command used with iframe embedding. |

Command rules:

- Call a method only after `gd-ready`. Before that, it rejects with `Dashboard is not ready for commands yet.` and dispatches `gd-error` with `phase: "invalidUsage"` and `command` set to the method name.
- Calling a method again while its previous call is in flight returns the same promise.
- Removing the element, or a reload that recreates the dashboard runtime, rejects in-flight commands with `Dashboard runtime is no longer active.`

### Events

| Event | `detail` | When |
| --- | --- | --- |
| `gd-ready` | `undefined` | The dashboard runtime accepts commands. Fires again whenever the runtime is recreated, for example after you assign a new `config` or `context`. |
| `gd-warning` | `{ phase: "pluginMode", message, pluginMode, ignoredSource: "extraPlugins" \| "backendPlugins", dashboard? }` | Plugins were skipped; see [Dashboard plugins](#dashboard-plugins). The message is also logged with `console.warn`. |
| `gd-error` | `{ phase, message, cause, command?, dashboard? }` | `phase` is `"init"` (dependencies, the context, or the dashboard failed to load), `"update"` (a re-render failed), `"invalidUsage"` (an identity change, or a command before `gd-ready`), `"refresh"`, or `"replaceFilters"` (the command failed). |
| `GDC.DASH/EVT.*` | The event's `payload` | Every [dashboard event](../../../dashboard-plugins/dashboard-events/) is forwarded as a DOM event named after its type, for example `GDC.DASH/EVT.INITIALIZED`. |

All events are `CustomEvent` instances that don't bubble and aren't cancelable.

```html
<gd-dashboard-embed dashboard="my-dashboard-id" id="dashboard"></gd-dashboard-embed>
<script type="module">
    const dashboardEl = document.getElementById("dashboard");

    dashboardEl.addEventListener("gd-error", (event) => {
        console.error(event.detail.phase, event.detail.message);
    });

    dashboardEl.addEventListener(
        "gd-ready",
        async () => {
            await dashboardEl.replaceFilters([
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "region" },
                        in: { values: ["West Coast"] },
                    },
                },
            ]);
        },
        { once: true },
    );
</script>
```

## `gd-insight-embed`

Renders [`InsightView`](../../../visualisations/insightview/).

### Attributes

| Attribute | Value | Description |
| --- | --- | --- |
| `insight` | Visualization ID | Required unless you set the `insight` property. Locked after the first render. |
| `workspace` | Workspace ID | Overrides the workspace of the shared context. |
| `locale` | Locale code such as `en-US` | Locale of the visualization UI. Attribute only; there is no `locale` property. |
| `title` | Boolean attribute or string | Present without a value: shows the title stored with the visualization. With a string: shows that string instead. Absent: no title. |
| `filters` | JSON array of filter objects | Parsed into `IFilter[]` and validated. An invalid value is logged with `console.error` and ignored. |
| `mapbox` | Mapbox access token | Sets `config.mapboxToken`; overrides the context token. Ignored once you assign the `config` property. |
| `agGrid` | AG Grid license key | Sets `config.agGridToken`; overrides the context token. Ignored once you assign the `config` property. |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `context` | `{ backend, workspaceId?, mapboxToken?, agGridToken? }` | Per-element backend and workspace. Missing fields fall back to the shared context. |
| `config` | The `config` prop of `InsightView` | Replaces the config built from the `mapbox` and `agGrid` attributes and the context tokens. |
| `insight` | `string \| ObjRef` | Visualization ID or reference. Same identity rule as the attribute. |
| `filters` | `IFilter[]` | Filters applied to the visualization. Replaces the `filters` attribute once assigned. |
| `title` | `boolean \| string` | Same meaning as the attribute. |

### Methods

| Method | Description |
| --- | --- |
| `refresh(): Promise<void>` | Evicts the cached definition of this visualization from the bundle's `InsightView` cache and remounts the visualization, so it's fetched again. Resolves when loading finishes (`insightLoaded`, or `loadingChanged` with `isLoading: false`); rejects when the visualization reports `error` or when the cache eviction fails. If the workspace or the `insight` input can't be resolved yet, the eviction is skipped and the visualization is only remounted. Concurrent calls share one promise. |

`refresh()` runs after the element has already rendered, so a stale visualization is briefly visible and fetched twice. When you control the mount timing, for example after a user edits a visualization and returns to a page of embeds, call [`clearCaches()`](../web-components-overview/#module-exports) and await it before mounting the elements instead.

### Events

| Event | `detail` | When |
| --- | --- | --- |
| `drill` | `IDrillEvent` | The user drills in the visualization. |
| `error` | `GoodDataSdkError` | Loading or computing the visualization failed. `gd-error` fires too. |
| `exportReady` | `IExportFunction` | The export function is available. |
| `loadingChanged` | `ILoadingState` | Loading started or finished. |
| `insightLoaded` | `IInsight` | The visualization definition has loaded. |
| `gd-ready` | `undefined` | Once, after the first successful render. |
| `gd-error` | `{ phase, message, cause, insight? }` | `phase` is `"init"`, `"update"` (the visualization reported an error; `insight` holds its ID), or `"invalidUsage"`. |

All events are `CustomEvent` instances that don't bubble and aren't cancelable.

```html
<gd-insight-embed insight="my-visualization-id" id="visualization" style="display: block; height: 500px"></gd-insight-embed>
<script type="module">
    const insightEl = document.getElementById("visualization");

    insightEl.addEventListener("insightLoaded", (event) => {
        console.log(event.detail);
    });

    insightEl.filters = [
        {
            positiveAttributeFilter: {
                displayForm: { identifier: "region" },
                in: { values: ["West Coast"] },
            },
        },
    ];
    insightEl.title = "Revenue by region";
</script>
```

## Migrate from `gd-dashboard` and `gd-insight`

1. Rename the tags. The attributes are the same (`dashboard`, `workspace`, `locale`, `readonly`, `mapbox`, `agGrid`; `insight`, `workspace`, `locale`, `title`, `filters`, `mapbox`, `agGrid`), and existing listeners for `GDC.DASH/EVT.*`, `drill`, `error`, `exportReady`, `loadingChanged`, and `insightLoaded` keep working.
2. Add CSS. Give the embed elements `display: block` or `display: flex` and a height in your own stylesheet.
3. Stop switching the `dashboard` or `insight` attribute to show another object. Replace the element instead; the embed elements reject identity changes with `gd-error`.
4. Move runtime updates from attributes to properties: `el.filters = [...]`, `el.title = "..."`, `el.config = {...}`, and `await el.replaceFilters([...])` for dashboard filters.
5. Listen for `gd-error`. The legacy elements only log load failures to the console.
6. Decide on plugins. Without `moduleFederationIntegration`, `gd-dashboard-embed` warns that plugins linked on the server were skipped. Set `pluginMode = "disabled"` to keep the legacy behavior without the warning, or provide `moduleFederationIntegration` to load them.
