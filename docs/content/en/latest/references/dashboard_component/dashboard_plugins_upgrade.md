---
title: Upgrade Dashboard Plugins
sidebar_label: Upgrade Dashboard Plugins
copyright: (C) 2007-2021 GoodData Corporation
id: upgrade_dashboard_plugins
---

To make sure your Dashboard Plugins are up-to-date with the latest bug fixes and features, it is a recommended practice
to occasionally upgrade them. In this article we the basic steps to achieve this are outlined.

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

If bootstrapping a new plugin is not suitable for you, you can follow these steps to perform the upgrade manually.

### Step 1. Upgrade the @gooddata dependencies

Upgrade all the `@gooddata` dependencies to the latest stable version.
To find the version used in your plugin, check your `package.json` file for the version next to the `"@gooddata/sdk-ui-dashboard"` entry.

> **Note:** Starting with version 10.0.0, the **gooddata-ui-sdk** no longer supports the GoodData Platform. It is necessary to remove `"@gooddata/sdk-backend-bear"` from the `package.json`.

To find the latest stable version available, run the following in your terminal:

```bash
npm view @gooddata/sdk-ui-dashboard dist-tags.latest
```

If the latest version is the same as the one you already have, your dependencies are already up to date and you can move to the next step.

If the versions are different, replace your version with the latest version available for all the `@gooddata` packages that have it in the `package.json` file.
Make sure to keep the carets (`^`) in. Then, run the install command of your package manager:

```bash
# for npm
npm install

# for yarn
yarn install
```

### Step 2. Check for updates in the config and harness files

There may also be some changes needed in some of the configuration files and files in the harness folder. To get the appropriate version of the files, use the following URL where the `vX.Y.Z` is the version you are upgrading to:

```bash
https://github.com/gooddata/gooddata-ui-sdk/blob/vX.Y.Z/tools/dashboard-plugin-template
```

Check the files there to see if there are any significant changes to your plugin directory.

> **Note:** For webpack.config.js, ignore the potential changes in the `proxy` object keys (e.g. if you have `"/api"` instead of `"/gdc"`, that is fine and you do not need to update that).

### Step 3. Test your plugin locally

Run your plugin locally using the `npm start` command and make sure it still behaves the way you want.

### Step 4. Build and deploy your plugin

Once your plugin works well, build it and deploy it to the hosting you are using for the plugin.
