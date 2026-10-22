---
legacy_path: references/dashboard_component/dashboard_plugins
title: Dashboard plugins
category: Dashboard & plugins
diataxis_type: explanation
api_symbols:
  - "@gooddata/sdk-ui-dashboard:DashboardPluginV1"
  - "@gooddata/sdk-ui-dashboard:IDashboardPluginContract_V1"
source_files:
  - src/plugins/plugin.ts
related_pages:
  - /docs/dashboard-plugins/develop-your-first-plugin
  - /docs/dashboard-plugins/dashboard-plugins-api
  - /docs/dashboard-plugins/embed-dashboard-with-plugins
  - /docs/dashboard-plugins/dashboard-plugins-upgrade
  - /docs/dashboard-plugins/customize-widgets
type: docs
description: Understand the dashboard plugin contract, lifecycle, bundling, runtime behavior, and maintenance requirements.
weight: 30
section: Dashboard & plugins
aliases:
  - "../references/dashboard_component/dashboard_plugins/"
---

Dashboard plugins let you add custom code to the Dashboard component. Use a
plugin to change how the dashboard renders content, add widgets, respond to
dashboard events, or customize the dashboard layout and filters.

## What a dashboard plugin is

A dashboard plugin is an object that implements a contract defined by
GoodData.UI and is built and bundled for the GoodData.UI dashboard loader.

Register a plugin in a workspace to use it on one or more dashboards. You can
parameterize each dashboard-to-plugin link so that the same plugin behaves
differently on different dashboards.

{{% alert color="info" %}}
You can find plugin examples in [GoodData Dashboard Plugin examples gallery](https://github.com/gooddata/gooddata-plugin-examples).
{{% /alert %}}

### Plugin contract and lifecycle

The plugin contract is an interface in `@gooddata/sdk-ui-dashboard`. See the
[plugin contract source code](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/plugins/plugin.ts).

The contract is versioned to allow for future breaking changes. The only
supported version is currently v1.

The contract requires you to provide or implement:

- Properties that provide metadata about the plugin.
- The `register` function, called during dashboard initialization before the
  Dashboard component mounts. Register customizations and event handlers here.
- The optional `onPluginLoaded` function, called after the plugin assets load
  and before dashboard initialization.
- The optional `onPluginUnload` function, called when the Dashboard component
  enhanced by the plugin unmounts.

### Build and bundling

The dashboard loader uses [webpack Module
Federation](https://webpack.js.org/concepts/module-federation/) to load and
link plugins at runtime.

A plugin must be built into a bundle that is configured to inherit these dependencies from the context into which it is loaded:

- All `@gooddata` dependencies
- `react` and `react-dom`

The plugin can depend on other packages and include custom assets as needed.

Build the plugin with the [default webpack
configuration](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/dashboard-plugin-template/webpack.config.cjs)
from the GoodData.UI plugin template.

### Runtime guarantees and implications

#### Lifecycle

The loader instantiates your plugin once for each dashboard load. When
implemented, `onPluginLoaded`, `register`, and `onPluginUnload` each run once
for that dashboard load.

#### Dependencies

The dashboard injects the latest GoodData.UI dependencies into the plugin at
runtime. New dashboard features therefore become available without rebuilding
the plugin, but a new dashboard feature can also be incompatible with an older
deployed plugin even without an API-level breaking change. Follow the
recommendations below to reduce that risk.

#### Exports and scheduled deliveries

A PDF, PPTX, or scheduled export of a dashboard is not rendered in the user's browser. A GoodData service
opens the dashboard in a headless browser in export mode, waits until the dashboard reports that every
widget has rendered, and captures the result. That dashboard loads its linked plugins exactly as it does for
a user, so your plugin runs on GoodData's infrastructure as well as in browsers. The consequences:

- Everything your plugin changes is part of the export: custom widgets, replaced visualization renderers,
  layout changes, decorated or hidden filters. You can use this deliberately, for example to render a
  print-friendly variant of a widget or to decide how the dashboard splits into slides. See
  [Customize dashboard export](../customize-dashboard-export/).
- The plugin files must be reachable from GoodData's infrastructure, not only from your users' network,
  with the same CORS and MIME type headers your users' browsers need. A host that is only available
  inside your corporate network works in the browser and fails in the export.
- There is no user to interact with the export. State that a user creates by clicking in your widget is
  not there; render from the dashboard state and filters instead, and branch on
  [export mode](../customize-dashboard-export/#detect-export-mode) when the export should look different.
- A widget that loads data asynchronously must report it through `useDashboardAsyncRender`, otherwise the
  export may capture it before the data arrives. See
  [Prepare a custom widget for export](../customize-dashboard-export/#prepare-a-custom-widget-for-export).

### Recommendations

- Use only the public dashboard plugin API and GoodData.UI interfaces. APIs
  marked alpha, beta, or internal can change without notice; see
  [API maturity](../../integrations/platform/api-maturity/).
- Do not manipulate the CSS or DOM structure of the dashboard. Instead, stick to the [theming guidelines](https://www.gooddata.ai/docs/cloud/customize-appearance/create-custom-themes/).
- Create small, focused plugins. Avoid plugins that drastically change the
  dashboard's behavior or appearance.
- For larger changes, consider [using the standalone Dashboard
  component](../../integrations/embedding/embed-dashboards/#dashboard-component)
  or [building a custom dashboard](../../integrations/embedding/embed-dashboards/#custom-dashboards).

### Maintenance

Dashboard plugins integrate with a dashboard that keeps changing in GoodData Cloud and GoodData.CN, so
breaking changes are sometimes necessary.

When this happens, you receive approximately six months to migrate your
plugins. After that period, the dashboard runs only with the latest version,
and plugins that have not been migrated will not load.

### Capabilities

The customization APIs expose the dashboard extension points to your plugin.
The dashboard provides these APIs to `register`, where you can:

- Add/remove event handlers
- Register custom widget types and React components used to render them
- Place items that will render your custom widgets
- Override React components to use when rendering visualizations

Event handlers and React components can also use a subset of the dashboard
selectors to read the current dashboard state.

### Choose an extension point

Use the extension point that matches the part of the dashboard you need to
change:

- Customize how saved visualizations render with `insightWidgets()`.
- Add arbitrary content such as images, forms, or additional text with
  `customWidgets()`.
- Change dashboard structure or export layout with `layout()`.
- Replace the filter bar or filter components with `filterBar()` and
  `filters()`.
- Observe dashboard behavior or react to commands with the event handler API.

The visualization and custom-widget APIs serve different purposes. A custom
visualization renderer receives `IDashboardInsightProps`, including the
visualization and the widget that holds it; an arbitrary custom widget receives
`IDashboardWidgetProps`.

### Current limitations

- GoodData does not host your built plugins. Host them yourself in a publicly available location that supports HTTPS.

## Where to go next

- To build, host, and link your first plugin, follow [Develop your first dashboard plugin](../develop-your-first-plugin/). The plugin needs HTTPS hosting that sends CORS headers and serves `.mjs` files as `text/javascript`, and the host must be allowed in your organization's Content Security Policy; the tutorial covers both.
- The `@gooddata/plugin-toolkit` CLI bootstraps the project (`npx @gooddata/plugin-toolkit@latest dashboard-plugin init`) and adds, links, and unlinks plugins and their parameters.
- For the customization and event APIs available in `register`, see the [Dashboard plugin API](../dashboard-plugins-api/).
- To run plugins in a dashboard rendered by your own React application rather than by GoodData, see [Embed a dashboard with plugins](../embed-dashboard-with-plugins/).
