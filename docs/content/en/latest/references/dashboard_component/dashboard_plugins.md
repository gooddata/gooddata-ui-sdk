---
title: Dashboard Plugins
sidebar_label: Dashboard Plugins
copyright: (C) 2007-2021 GoodData Corporation
id: dashboard_plugins
---

Dashboard plugins allow developers to create and integrate custom code into the Dashboard component. With the plugins, you
as a developer can customize and enhance the default dashboard experience available to the dashboard consumers.

The plugins are an essential part of the GoodData dashboard stack.

> #### Important change in the dashboard plugins since version 9.5.0:
>
> Before v9.5.0, all dashboard plugins were locked to a set Dashboard component and some other GoodData.UI packages that were used to build the plugin. From v9.5.0 onwards, all plugins will always run with the latest version of these packages, which will be injected into the plugin at runtime. Version locking is now deprecated and no longer supported. We recommend you to [upgrade](../dashboard_plugins_upgrade/) as soon as possible.

## What a dashboard plugin is

A dashboard plugin is an object that implements a contract defined by GoodData and that is built and bundled
in a way supported by the GoodData.UI dashboard loader.

The dashboard plugins are registered into a workspace and from then on can be used on any number of dashboards. To
facilitate plugin reuse across dashboards, you can parameterize the link between the dashboard and the plugin.

> You can find plugin examples in [GoodData Dashboard Plugin examples gallery](https://github.com/gooddata/gooddata-plugin-examples).

### Plugin contract and lifecycle

The plugin contract is described by an interface defined in the `@gooddata/sdk-ui-dashboard` package. You can see the code
[here](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/plugins/plugin.ts).

The contract is versioned to accommodate for potential future breaking changes. Currently, the only supported version of
the contract is v1, which we intend to enhance in a backward-compatible fashion.

The contract is fairly straightforward and specifies the things that you as an author have to provide or implement:

- The properties through which you provide metadata about the plugin
- The `register` function that will be called during dashboard initialization and before the Dashboard component
  is mounted. This is where your code can register customizations and enhancements.
- (Optional) The `onPluginLoaded` lifecycle function that will be called as the plugin assets are loaded and
  before dashboard initialization
- (Optional) The `onPluginUnload` lifecycle function that will be called when the Dashboard component
  enhanced by your plugin is unmounted

### Build and bundling

The dashboard loader relies on the [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) feature to load and link
plugins at runtime.

A plugin must be built into a bundle that is configured to inherit these dependencies from the context into which it is loaded:

- All `@gooddata` dependencies
- `react` and `react-dom`

Apart form this, the plugin can depend on other packages and include custom assets as it sees fit.

Building the plugin correctly is essential to have the plugin load successfully. The plugin template that is part of
GoodData.UI ships with the [default Webpack config](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/dashboard-plugin-template/webpack.config.js)
that you should use as a starting point.

### Runtime guarantees and implications

#### Lifecycle

Every time your plugin is loaded to be used on a dashboard, it will be instantiated exactly once. If implemented, your
`onPluginLoaded`, `register` and `onPluginUnload` will be called once every time the dashboard that links to your
plugin is loaded.

#### Dependencies

All GoodData.UI dependencies are injected into the dashboard plugin at runtime with their latest versions. This ensures that all new features become available to the dashboard associated with the plugin as soon as we release them. However, this approach has certain consequences. In particular, there may be instances where a new dashboard component feature, upon rollout, is incompatible with your deployed dashboard plugin. This incompatibility can occur even if there is no breaking change at the API level. Since dashboard plugins offer extensive capabilities for customization, we cannot control the code of deployed plugins. To minimize these issues, please adhere to the following recommendations.

### Recommendations

- Use only the public dashboard plugins API and GoodData.UI interfaces. Anything marked as alpha, beta, or internal within the plugin code should be used at your own risk. If you are missing an API for your particular use case or need something not yet marked as stable, please [get in touch with us](../../../#Home-JoinLearn), and we may consider updating or extending it.
- Do not manipulate the CSS or DOM structure of the dashboard. Instead, stick to the [theming guidelines](https://www.gooddata.com/docs/cloud/customize-appearance/create-custom-themes/).
- Create smaller, focused plugins. Avoid large, complicated plugins that drastically change the dashboard's behavior and look.
- For more complex changes, consider using better-suited approaches, such as [using the standalone dashboard component](../../../learn/embed_dashboards/#EmbedDashboards-Dashboardcomponent) or [building your custom dashboard](../../../learn/embed_dashboards/#EmbedDashboards-Customdashboards)

### Maintenance

Since dashboard plugins are primarily integrated with our ever-evolving SaaS platform (GoodData Cloud), there are occasions when introducing breaking changes is necessary.

When this occurs, a grace period of approximately six months will be provided, allowing for the safe migration of your plugins. However, after this time frame, the dashboard will default to running with the latest version, and reverting to older versions will not be possible. Any plugins that have not been migrated to the new API version will not load once the grace period concludes.

### Capabilities

The dashboard customization and enhancement capabilities are exposed to your plugin code via customization APIs. An
instance of the API will be provided to your code at the time of the plugin's `register`. You can then use those APIs to:

- Add/remove event handlers
- Register custom widget types and React components used to render them
- Place items that will render your custom widgets
- Override React components to use when rendering visualizations

Furthermore, your event handlers and React components can use a subset of Model Selector APIs to obtain additional
data from the current state of the dashboard.

### Current limitations

- GoodData does not provide hosting for your built plugins. When you build your plugin, you will have to
  host it yourself in a publicly available location that supports HTTPS.

## Before you start

A minimum setup is needed before your KPI Dashboards can start using plugins.

**Steps:**

1. Set up hosting for your plugins.

2. Update the Content Security Policy of your GoodData instance's gateway to enable loading plugins from the hosting location.

## Getting started

To start building the dashboard plugins, use the Plugin Development Toolkit.

The Toolkit comes with a CLI tool that helps you bootstrap a new plugin. To initialize a new plugin, run the following command:

```bash
npx @gooddata/plugin-toolkit@latest dashboard-plugin init
```

You will be prompted to enter all the essentials, and then the tool will bootstrap a new plugin project for you. This
project will contain a Walking Skeleton for your plugin including scripts to correctly build the plugin bundles.

The toolkit supports additional actions:

- Adding a plugin to a workspace
- Linking a dashboard with a plugin added to a workspace
- Unlinking a dashboard from a plugin

To learn more, follow the documentation in your new plugin's README file. Happy coding!
