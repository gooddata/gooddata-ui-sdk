---
title: Dashboard custom element
sidebar_label: Dashboard custom element
copyright: (C) 2007-2026 GoodData Corporation
id: webcomponents_dashboard
---

For new integrations, embed dashboards using the `gd-dashboard-embed` custom element.
The legacy `gd-dashboard` tag remains available for existing integrations that depend on the original
attribute-driven custom element behavior.

```html
<!-- minimal setup -->
<gd-dashboard-embed dashboard="my-dashboard-id"></gd-dashboard-embed>
```

## Primary embed runtime

`gd-dashboard-embed` is the recommended dashboard embed runtime for new integrations. It exposes a
property-first API: JavaScript properties are the live control surface, while HTML attributes serve only
as bootstrap hints for the initial render. Assigning a new property value triggers a re-render without
remounting the dashboard.

## Supported properties

Properties are set from JavaScript after the element is in the DOM. Assigning a new object reference
replaces the previous snapshot and schedules a re-render.

```js
const dashboardEl = document.getElementById("some-dom-id");

dashboardEl.context = { backend: myBackend, workspaceId: "my-workspace-id" };
dashboardEl.config = { isReadOnly: true };
```

> Always assign a **new object reference**. Mutating an existing object in place will not trigger a re-render.

| Property                      | Type                                                     | Notes                                                   |
| ----------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `context`                     | `{ backend, workspaceId?, mapboxToken?, agGridToken? }`  | Live — replaces the previous context snapshot           |
| `config`                      | `IDashboardProps["config"]`                              | Live — replaces the previous config snapshot            |
| `dashboard`                   | string                                                   | Identity — immutable after the first successful render  |
| `extraPlugins`                | `IEmbeddedPlugin \| IEmbeddedPlugin[]`                   | Loader-backed plugin injection                          |
| `pluginMode`                  | `"all" \| "embeddedOnly" \| "backendOnly" \| "disabled"` | Controls which plugins are activated (default: `"all"`) |
| `moduleFederationIntegration` | object                                                   | Module Federation host setup                            |

## Supported attributes

HTML attributes are used for the initial bootstrap only. Changing an attribute after the first render has
no effect; use the corresponding property instead.

```html
<!-- all supported attributes -->
<gd-dashboard-embed
    dashboard="my-dashboard-id"
    workspace="my-workspace-id"
    locale="en_US"
    readonly
    mapbox="my-mapbox-token"
    agGrid="my-ag-grid-license"
></gd-dashboard-embed>
```

- `dashboard` - mandatory, the ID of the dashboard to embed.
- `workspace` - optional, the ID of the workspace for this dashboard. By default, it is taken from the context (e.g., from the script URL).
- `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
- `readonly` - optional. If present, the dashboard is embedded in read-only mode and all interactions that would alter backend state are disabled (e.g., creating/changing alerts, creating scheduled emails).
- `mapbox` - optional, a Mapbox token for geo visualizations.
- `agGrid` - optional, an AG Grid license key.

You can also provide a workspace id on the context level instead of passing it as an attribute to every dashboard. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported methods

```js
// Reinitializes the dashboard using the current context and config snapshots.
await dashboardEl.refresh();

// Replaces the full filter selection via the dashboard command model.
await dashboardEl.replaceFilters([
    { positiveAttributeFilter: { displayForm: { identifier: "attr.region" }, in: ["US"] } },
]);
```

Concurrent calls to the same method coalesce onto the same in-flight promise. Both methods reject if the
dashboard has not yet emitted `gd-ready`.

## Dashboard plugins

`gd-dashboard-embed` supports loading dashboard plugins through three cooperating properties: `pluginMode`,
`extraPlugins`, and `moduleFederationIntegration`.

### Plugin modes

`pluginMode` controls which plugin sources are active. The default is `"all"`.

| Value             | Loads backend-linked plugins | Loads `extraPlugins` | Requires MF integration |
| ----------------- | ---------------------------- | -------------------- | ----------------------- |
| `"all"` (default) | yes                          | yes                  | yes                     |
| `"embeddedOnly"`  | no                           | yes                  | no                      |
| `"backendOnly"`   | yes                          | no                   | yes                     |
| `"disabled"`      | no                           | no                   | no                      |

Setting `pluginMode` to a value that ignores a supplied source (`"backendOnly"` when `extraPlugins` is
set, or `"disabled"` when either source is present) causes the element to emit a `gd-warning` event
rather than failing silently.

### Embedded plugins

Embedded plugins are built and bundled with your host application. Pass them via the `extraPlugins`
property — no Module Federation required.

```js
import { myPlugin } from "./my-plugin.js";

const el = document.querySelector("gd-dashboard-embed");
el.pluginMode = "embeddedOnly"; // or "all" to combine with backend plugins
el.extraPlugins = [
    {
        factory: () => myPlugin(),
        parameters: "param1=value1;param2=value2",
    },
];
```

Each entry in the array has the shape:

| Field        | Type                                | Notes                                                     |
| ------------ | ----------------------------------- | --------------------------------------------------------- |
| `factory`    | `() => IDashboardPluginContract_V1` | Returns a plugin instance                                 |
| `parameters` | string (optional)                   | Semicolon-delimited key=value string passed to the plugin |

### Backend-linked plugins and Module Federation

Backend-linked plugins are stored in GoodData and loaded at runtime via [Module Federation][4].
To load them, your host application must be built with Webpack's `ModuleFederationPlugin` and expose
its sharing runtime to the element:

```js
const el = document.querySelector("gd-dashboard-embed");
el.pluginMode = "all"; // or "backendOnly"
el.moduleFederationIntegration = {
    __webpack_init_sharing__: __webpack_init_sharing__,
    __webpack_share_scopes__: __webpack_share_scopes__,
};
```

A minimal Webpack configuration for the host application:

```js
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
    plugins: [
        new ModuleFederationPlugin({
            name: "myHostApp",
            shared: {
                "react/jsx-runtime": { singleton: true, requiredVersion: false },
                "react-intl": { singleton: true, requiredVersion: false },
            },
        }),
    ],
};
```

## Supported events

`gd-dashboard-embed` emits [the same events as the Dashboard component][3] and also emits `gd-ready` and `gd-error`.

Events **do not bubble** and **are not cancelable**. Here is how you can subscribe to one from your code:

```html
<gd-dashboard-embed dashboard="my-dashboard-id" id="some-dom-id"></gd-dashboard-embed>
<script>
    const dashboardEl = document.getElementById("some-dom-id");
    dashboardEl.addEventListener("GDC.DASH/EVT.INITIALIZED", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });

    dashboardEl.addEventListener("gd-ready", () => {
        console.log("dashboard ready");
    });

    dashboardEl.addEventListener("gd-error", (event) => {
        const { phase, message, cause } = event.detail;
        // phase: "init" | "update" | "refresh" | "replaceFilters" | "invalidUsage"
        console.error(phase, message, cause);
    });
</script>
```

The `gd-error` event detail has the following shape:

| Field     | Type    | Description                                                                                         |
| --------- | ------- | --------------------------------------------------------------------------------------------------- |
| `phase`   | string  | When the error occurred: `"init"`, `"update"`, `"refresh"`, `"replaceFilters"`, or `"invalidUsage"` |
| `message` | string  | Human-readable error description                                                                    |
| `cause`   | unknown | The underlying error object, if available                                                           |

`gd-dashboard-embed` also emits `gd-warning` when a plugin mode conflict is detected — for example,
when `extraPlugins` are provided but `pluginMode` is set to `"backendOnly"` or `"disabled"`.

```js
dashboardEl.addEventListener("gd-warning", (event) => {
    const { phase, pluginMode, ignoredSource, message } = event.detail;
    // phase: "pluginMode"
    // ignoredSource: "extraPlugins" | "backendPlugins"
    console.warn(phase, pluginMode, ignoredSource, message);
});
```

## Legacy compatibility tag

`gd-dashboard` remains available for older integrations that are centered around attribute-driven updates and
expect the original custom element behavior. Prefer `gd-dashboard-embed` for new embedding work; use `gd-dashboard`
only when you need continuity with an existing integration.

```html
<!-- minimal setup -->
<gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>
```

### Supported attributes

`gd-dashboard` is fully attribute-driven. Changing any attribute after mount triggers a full re-render.

```html
<gd-dashboard
    dashboard="my-dashboard-id"
    workspace="my-workspace-id"
    locale="en_US"
    readonly
    mapbox="my-mapbox-token"
    agGrid="my-ag-grid-license"
></gd-dashboard>
```

- `dashboard` - mandatory, the ID of the dashboard to embed.
- `workspace` - optional, the ID of the workspace. By default, it is taken from the context (e.g., from the script URL).
- `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
- `readonly` - optional. If present, the dashboard is embedded in read-only mode.
- `mapbox` - optional, a Mapbox token for geo visualizations.
- `agGrid` - optional, an AG Grid license key.

### Supported events

`gd-dashboard` forwards [the same events as the Dashboard component][3]. Events **do not bubble** and **are not cancelable**.

```html
<gd-dashboard dashboard="my-dashboard-id" id="some-dom-id"></gd-dashboard>
<script>
    const dashboardEl = document.getElementById("some-dom-id");
    dashboardEl.addEventListener("GDC.DASH/EVT.INITIALIZED", (event) => {
        console.log(event.detail);
    });
</script>
```

`gd-dashboard` does **not** emit `gd-ready` or `gd-error`, and does not expose `refresh()` or `replaceFilters()`.
These capabilities are available only on `gd-dashboard-embed`.

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]: ../authentication/
[3]: https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.dashboardeventtype.html
[4]: https://webpack.js.org/concepts/module-federation/
