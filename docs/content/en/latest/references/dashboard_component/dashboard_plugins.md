---
title: Dashboard Plugins
sidebar_label: Dashboard Plugins
copyright: (C) 2007-2021 GoodData Corporation
id: dashboard_plugins
---

Dashboard plugins allow developers to create and integrate custom code into the Dashboard component. With the plugins, you
as a developer can customize and enhance the default dashboard experience available to the dashboard consumers.

The plugins are an essential part of the GoodData dashboard stack.

## What a dashboard plugin is

A dashboard plugin is an object that implements a contract defined by GoodData and that is built and bundled
in a way supported by the GoodData.UI dashboard loader.

The dashboard plugins are registered into a workspace and from then on can be used on any number of dashboards. To
facilitate plugin reuse across dashboards, you can parameterize the link between the dashboard and the plugin.

>You can find plugin examples in [GoodData Dashboard Plugin examples gallery](https://github.com/gooddata/gooddata-plugin-examples).

### Plugin contract and lifecycle

The plugin contract is described by an interface defined in the `@gooddata/sdk-ui-dashboard` package. You can see the code
[here](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-dashboard/src/plugins/plugin.ts).

The contract is versioned to accommodate for potential future breaking changes. Currently, the only supported version of
the contract is v1, which we intend to enhance in a backward-compatible fashion.

The contract is fairly straightforward and specifies the things that you as an author have to provide or implement:

-  The properties through which you provide metadata about the plugin
-  The `register` function that will be called during dashboard initialization and before the Dashboard component
   is mounted. This is where your code can register customizations and enhancements.
-  (Optional) The `onPluginLoaded` lifecycle function that will be called as the plugin assets are loaded and
   before dashboard initialization
-  (Optional) The `onPluginUnload` lifecycle function that will be called when the Dashboard component
   enhanced by your plugin is unmounted

### Build and bundling

The dashboard loader relies on the [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) feature to load and link
plugins at runtime.

A plugin must be built into a bundle that is configured to inherit these dependencies from the context into which it is loaded:

-  All `@gooddata` dependencies
-  `react` and `react-dom`

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

When you build your plugin against a particular version of `@gooddata/sdk-ui-dashboard`, the plugin will be "locked" to
that version of the Dashboard component. Transitively, any dashboards that link with your plugin will be locked to
that same version of the Dashboard component.

This means that any changes and improvements that we make to the KPI Dashboards will not be available on the
dashboards enhanced by the plugin until you upgrade your plugin and build it against the latest version of
`@gooddata/sdk-ui-dashboard`.

When you have more than one plugin linked to the same dashboard, all these plugins are validated with regard to the version of
the Dashboard component they can be run with. If no version compatible with all the linked plugins on the dashboard is found,
none of the plugins is displayed on the dashboard, and an error message is logged into the browser console. In this case,
review the plugins and [adjust their settings](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/dashboard-plugin-template/README.template.md#how-can-i-setup-compatibility-of-the-plugin) so that they can run on the same version of the Dashboard component.

We decided to go with this strict behavior to give you strong guarantees that the plugins enhanced by your
dashboard will work predictably regardless of how we change the default experience.

In the future, we may expand on this area and allow your plugins to automatically follow the latest stable build
of the Dashboard component.

**NOTE:** Because the core `@gooddata` dependencies are provided to your plugin at runtime, the dashboard enhanced
by your plugin will still benefit from improvements related to the insight rendering. The interoperability of the insight rendering
between Analytical Designer and the KPI Dashboards is in place.

### Capabilities

The dashboard customization and enhancement capabilities are exposed to your plugin code via customization APIs. An
instance of the API will be provided to your code at the time of the plugin's `register`. You can then use those APIs to:

-  Add/remove event handlers
-  Register custom widget types and React components used to render them
-  Place items that will render your custom widgets
-  Override React components to use when rendering insights
-  Override React components to use when rendering KPIs

Furthermore, your event handlers and React components can use a subset of Model Selector APIs to obtain additional
data from the current state of the dashboard.

### Reminder about API maturity

The dashboard plugin and Dashboard component APIs follow the API maturity guidelines. All
the plugin APIs and the customization APIs are marked as `@public`, and we will not be making any breaking changes to them.

However, the API landscape of the Dashboard component is vast and may be tempting. Going through the code, you will find many
interesting APIs that are currently in the `@alpha` stage.

We cannot prevent you from using the `@alpha` APIs. However, be aware that using those APIs will most likely
lead to breakage when you try to upgrade your dashboard plugin to use a newer version of the `@gooddata/sdk-ui-dashboard` package.

### Current limitations

-  The plugins are only in effect for consumers in view mode. The plugins are not loaded in edit mode.
-  GoodData does not provide hosting for your built plugins. When you build your plugin, you will have to
   host it yourself in a publicly available location that supports HTTPS.


## Before you start

A minimum setup is needed before your KPI Dashboards can start using plugins.

The setup is different for the GoodData platform and GoodData.CN.

### Configuration on the GoodData platform

1.  Ensure that the `dashboardComponentDevRollout` platform setting is set to `true` for your GoodData domain or at least
    for the workspace where you want to use the plugins.

2.  Set up hosting for the plugins, and [request GoodData Support](https://support.gooddata.com/hc/en-us/requests/new?ticket_form_id=582387)
    to add it to the `dashboardPluginHosts` setting.

    This is a security measure. Only GoodData Support can add hosts to the `dashboardPluginHosts` list.
    The goal of this setting is to control from where the plugins can be loaded. This should
    be a trusted and controlled location where only privileged developers can upload plugin artifacts.

    You can request multiple hosts to be added to the list. All hosts must run on the HTTPS protocol.

    >**IMPORTANT!** Never put untrusted hosts into this list. Always put the hosts that are under your organization's
    control and appropriate review and governance. Otherwise, you run risk of malicious code leaking your data.

>**IMPORTANT LIMITATION:** The dashboard plugins will never load for a user that is a domain admin. For domain admins,
the KPI Dashboards component will prevent load of any external scripts and assets outside of the GoodData
platform.

### Configuration on GoodData Cloud

1. Set up hosting for your plugins.

2. Update the Content Security Policy of your GoodData Cloud instance's gateway to enable loading plugins from the hosting location.

### Configuration on GoodData.CN

1. Set up hosting for your plugins.

2. Update the Content Security Policy of your GoodData.CN installation's gateway to enable loading plugins from the hosting location.

## Getting started

To start building the dashboard plugins, use the Plugin Development Toolkit.

The Toolkit comes with a CLI tool that helps you bootstrap a new plugin. To initialize a new plugin, run the following command:

```bash
npx @gooddata/plugin-toolkit dashboard-plugin init
```

You will be prompted to enter all the essentials, and then the tool will bootstrap a new plugin project for you. This
project will contain a Walking Skeleton for your plugin including scripts to correctly build the plugin bundles.

The toolkit supports additional actions:

-  Adding a plugin to a workspace
-  Linking a dashboard with a plugin added to a workspace
-  Unlinking a dashboard from a plugin

To learn more, follow the documentation in your new plugin's README file. Happy coding!