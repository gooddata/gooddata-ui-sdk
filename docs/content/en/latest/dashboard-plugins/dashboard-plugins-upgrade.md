---
legacy_path: references/dashboard_component/dashboard_plugins_upgrade
title: Upgrade dashboard plugins
category: Dashboard & plugins
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-dashboard:DashboardPluginV1"
source_files:
  - src/plugins/plugin.ts
related_pages:
  - /docs/dashboard-plugins/dashboard-plugins
  - /docs/dashboard-plugins/develop-your-first-plugin
  - /docs/dashboard-plugins/dashboard-plugins-api
  - /docs/getting-started/platform-compatibility
  - /docs/integrations/platform/esm-only
type: docs
description: Upgrade a dashboard plugin by rebuilding it from the latest toolkit template or updating its dependencies and configuration before testing and deployment.
weight: 39
section: Dashboard & plugins
aliases:
  - "../references/dashboard_component/dashboard_plugins_upgrade/"
---

Upgrade your dashboard plugins from time to time to get the latest bug fixes and features.

You can upgrade the plugins by:

-   Bootstrapping a new plugin, or
-   Manually performing the necessary steps.

## Bootstrap a new plugin

The safest way to perform the upgrade is to bootstrap a whole new plugin using the following command:

```bash
npx @gooddata/plugin-toolkit@latest dashboard-plugin init
```

1. Specify the same name as your original plugin.
2. Carry over the code you have in your plugin to ensure that all the dependencies, configuration, etc. are up-to-date.
3. Test your plugin.
4. Rebuild the plugin.
5. Redeploy the plugin to the hosting of your choice.

## Manually upgrade the plugin

If bootstrapping a new plugin doesn't suit you, upgrade the plugin manually in this order.

### Upgrade the @gooddata dependencies

Upgrade all the `@gooddata` dependencies to the latest stable version.
To find the version used in your plugin, check your `package.json` file for the version next to the `"@gooddata/sdk-ui-dashboard"` entry.

{{% alert color="warning" title="Upgrading from version 9" %}}
GoodData.UI 10 and later don't support GoodData Legacy. If your plugin still lists `@gooddata/sdk-backend-bear` in `package.json`, remove it. See [Platform compatibility](../../getting-started/platform-compatibility/).
{{% /alert %}}

To find the latest stable version available, run the following in your terminal:

```bash
npm view @gooddata/sdk-ui-dashboard dist-tags.latest
```

If the latest version is the same as the one you already have, your dependencies are already up to date and you can move to the next step.

If the versions are different, replace your version with the latest version available for all the `@gooddata` packages that have it in the `package.json` file.
Make sure to keep the carets (`^`) in. Then, run the install command of your package manager:

```bash
npm install
```

With yarn, run `yarn install`.

### Check for updates in the config and harness files

The configuration files and the files in the harness folder may need changes too. Compare them with the plugin template of the version you are upgrading to, at `https://github.com/gooddata/gooddata-ui-sdk/tree/vX.Y.Z/tools/dashboard-plugin-template` (replace `vX.Y.Z` with that version).

{{% alert color="info" title="Proxy settings" %}}
In `webpack.config.cjs`, ignore differences in the development server `proxy` settings that only reflect your own hostname and workspace; you do not need to update them.
{{% /alert %}}

### Test your plugin locally

Run your plugin locally using the `npm start` command and make sure it still behaves the way you want.

### Build and deploy your plugin

Once your plugin works well, build it and deploy it to the hosting you are using for the plugin.
