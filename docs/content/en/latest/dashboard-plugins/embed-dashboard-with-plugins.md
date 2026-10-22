---
title: Embed a dashboard with plugins
category: Dashboard & plugins
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui-loaders:useDashboardLoader"
  - "@gooddata/sdk-ui-loaders:IDashboardLoadOptions"
  - "@gooddata/sdk-ui-loaders:AdaptiveLoadOptions"
  - "@gooddata/sdk-ui-loaders:IEmbeddedPlugin"
  - "@gooddata/sdk-ui-dashboard:ReactDashboardContext"
source_files:
  - src/dashboard/useDashboardLoader.ts
  - src/dashboard/types.ts
related_pages:
  - /docs/integrations/hooks/use-dashboard-loader
  - /docs/dashboard-plugins/dashboard
  - /docs/dashboard-plugins/dashboard-plugins
  - /docs/integrations/embedding/embed-dashboards
  - /docs/integrations/web-components/embed-custom-elements
type: docs
description: Render a dashboard in your React application with its plugins, bundled with your app, linked in the workspace, or both.
weight: 34
section: Dashboard & plugins
---

The `Dashboard` component renders a saved dashboard, but on its own it ignores the plugins linked to that
dashboard. To run plugins inside your own application, load the dashboard with the
[`useDashboardLoader`](../../integrations/hooks/use-dashboard-loader/) hook from `@gooddata/sdk-ui-loaders`.
The loader resolves the plugins, runs their lifecycle, and returns the component to render together with the
props it needs.

Pick the setup by where the plugins come from:

| Plugins come from | `loadingMode` | What else you need |
| --- | --- | --- |
| Your application bundle only | `"staticOnly"` with `extraPlugins` | Nothing else |
| The workspace, linked to the dashboard | `"adaptive"` | Module Federation in your build (webpack today) |
| Both | `"adaptive"` with `extraPlugins` | The same, plus `additionalReduxContext` |

## Embed with local plugins only

A local plugin is a class that extends `DashboardPluginV1` and ships in your application bundle. Pass it
through `extraPlugins` and set `loadingMode` to `"staticOnly"`. Plugins linked to the dashboard in the
workspace are ignored in this mode, so it is the right choice while you develop a plugin and for environments
where running remotely hosted code is not acceptable.

```tsx
import { idRef } from "@gooddata/sdk-model";
import {
    DashboardPluginV1,
    type DashboardContext,
    type IDashboardCustomizer,
    type IDashboardEventHandling,
} from "@gooddata/sdk-ui-dashboard";
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";

// A minimal plugin. See Dashboard plugin API for what register() can do.
class LocalPlugin extends DashboardPluginV1 {
    public readonly author = "your name";
    public readonly displayName = "Local plugin"; // shown in loader debug output
    public readonly version = "1.0";

    public register(
        _ctx: DashboardContext,
        _customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        // register customizations and event handlers here
    }
}

const dashboardRef = idRef("<dashboard-identifier>");

export function LocalPluginsExample() {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        loadingMode: "staticOnly",
        // one plugin or an array; `parameters` is optional, see Parameterization in Dashboard plugin API
        extraPlugins: { factory: () => new LocalPlugin() },
    });

    if (status === "loading" || status === "pending") {
        return <div>Loading dashboard...</div>;
    }

    if (status === "error") {
        return <div>Error loading dashboard: {error.message}</div>;
    }

    // The loader returns the component to render and the props to pass to it.
    const { DashboardComponent, props } = result;

    return <DashboardComponent {...props} />;
}
```

The hook reads the backend and workspace from `BackendProvider` and `WorkspaceProvider`, or from the
`backend` and `workspace` options. For a component that renders the loading and error states for you, use
[`DashboardStub`](../../integrations/hooks/use-dashboard-loader/#dashboardstub-a-ready-made-wrapper).

## Embed with plugins linked to the dashboard

In `"adaptive"` mode the loader behaves like the GoodData dashboards: it reads which plugins are linked to the
dashboard, downloads them from their hosting, and loads the dashboard engine they were built against. This
needs three things in your application.

### Set up Module Federation in your build

Plugins are Module Federation remotes, and the loader joins them to your application through the Module
Federation share scope. Today that runtime comes from webpack, so your application has to be built with
webpack 5 and the `ModuleFederationPlugin`. Declare React and every `@gooddata` package as shared singletons,
because the plugins and your application have to use one React and one set of GoodData.UI contexts:

```js
// webpack.config.cjs
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

// Every @gooddata package has to be a singleton: plugins share the SDK's React contexts with your app.
const gooddataSharePackagesEntries = Object.keys(deps)
    .filter((pkg) => pkg.startsWith("@gooddata"))
    .reduce((acc, pkg) => ({ ...acc, [pkg]: { singleton: true, eager: true } }), {});

module.exports = {
    // ...the rest of your webpack config
    plugins: [
        // ...the rest of your plugins
        new ModuleFederationPlugin({
            shared: {
                react: { import: "react", shareKey: "react", singleton: true, eager: true },
                "react-dom": { singleton: true, eager: true },
                "react/jsx-runtime": { singleton: true, eager: true },
                ...gooddataSharePackagesEntries,
            },
        }),
    ],
};
```

`eager: true` puts the shared packages into your initial bundle, so they are available before the first
plugin loads. If you leave it out, load your application's entry through a dynamic `import()` so webpack can
resolve the shared modules asynchronously first.

{{% alert color="warning" title="Module Federation runtime required" %}}
The adaptive loader currently needs webpack's Module Federation runtime (`__webpack_init_sharing__` and
`__webpack_share_scopes__`), which other bundlers don't provide. An application bundled with Vite or another
bundler can run [local plugins](#embed-with-local-plugins-only) but cannot load the plugins linked to a
dashboard. If you need those without this runtime, [embed the dashboard in an iframe](https://www.gooddata.ai/docs/cloud/embed-visualizations/iframes/)
or use the hosted GoodData dashboards.
{{% /alert %}}

### Allow the plugin host

The browser fetches plugin files from the plugin's hosting on behalf of your application, so the same
[hosting requirements](../develop-your-first-plugin/#host-the-plugin) apply as for the GoodData dashboards,
with your application in the role of the GoodData host: the plugin host must serve the files over HTTPS,
with the right MIME type, and with an `Access-Control-Allow-Origin` header that allows your application's
origin (or `*`).

If your application sets a Content Security Policy, add the plugin host to `script-src`, and to `img-src`,
`style-src`, or `font-src` when the plugin loads such assets. The
[CSP you configure in GoodData](../develop-your-first-plugin/#allow-the-host-in-gooddatas-csp) applies only
to dashboards that GoodData serves, not to your application.

### Load the dashboard

Pass the Module Federation runtime to the loader through `adaptiveLoadOptions`:

```tsx
import { idRef } from "@gooddata/sdk-model";
import { type AdaptiveLoadOptions, useDashboardLoader } from "@gooddata/sdk-ui-loaders";

// The interop object the loader uses to join plugins to the Module Federation share scope.
// Both globals exist once ModuleFederationPlugin is in the build.
const adaptiveLoadOptions: AdaptiveLoadOptions = {
    moduleFederationIntegration: {
        __webpack_init_sharing__:
            typeof __webpack_init_sharing__ === "undefined" ? null : __webpack_init_sharing__,
        __webpack_share_scopes__:
            typeof __webpack_share_scopes__ === "undefined" ? null : __webpack_share_scopes__,
    },
};

const dashboardRef = idRef("<dashboard-identifier>");

export function LinkedPluginsExample() {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        loadingMode: "adaptive",
        adaptiveLoadOptions,
    });

    if (status === "loading" || status === "pending") {
        return <div>Loading dashboard...</div>;
    }

    if (status === "error") {
        return <div>Error loading dashboard: {error.message}</div>;
    }

    const { DashboardComponent, props } = result;

    return <DashboardComponent {...props} />;
}
```

A dashboard with no linked plugins falls back to the `"staticOnly"` behavior, so the same code works for
every dashboard in the workspace. The loader logs the engine version and the plugins it found with
`console.debug`, which helps when a plugin does not show up.

## Combine local and linked plugins

To add your own plugins on top of the ones linked to the dashboard, pass `extraPlugins` in `"adaptive"` mode
and forward `ReactDashboardContext` to the rendered component as `additionalReduxContext`:

```tsx
import { ReactDashboardContext } from "@gooddata/sdk-ui-dashboard";
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";

export function MixedPluginsExample() {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        loadingMode: "adaptive",
        adaptiveLoadOptions,
        extraPlugins: { factory: () => new LocalPlugin() },
    });

    // ...handle the loading and error states as above

    const { DashboardComponent, props } = result;

    return (
        <DashboardComponent
            {...props}
            // Keep the local plugin's hooks connected to the dashboard store
            additionalReduxContext={ReactDashboardContext}
        />
    );
}
```

The linked plugins run against the dashboard engine the loader downloaded for them, while your local plugin
is compiled against the `@gooddata/sdk-ui-dashboard` in your bundle, so the two have different copies of the
Redux context that `useDashboardSelector` and `useDashboardDispatch` read from. Passing your application's
`ReactDashboardContext` makes the dashboard put its store into both contexts. Without it, hooks in your local
plugin's components find no store and throw.

## Without React

The `gd-dashboard-embed` custom element loads plugins the same way: `extraPlugins` for local plugins and
`moduleFederationIntegration` for plugins linked to the dashboard, with `pluginMode` choosing between them.
See [Dashboard plugins on the embed elements page](../../integrations/web-components/embed-custom-elements/#dashboard-plugins).
