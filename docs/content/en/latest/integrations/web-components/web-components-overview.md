---
legacy_path: learn/web_components
title: Web Components overview
category: Integrations / Web Components
diataxis_type: explanation
source_files:
  - src/context.ts
related_pages:
  - /docs/integrations/web-components/embed-custom-elements
  - /docs/integrations/web-components/dashboard-custom-element
  - /docs/integrations/web-components/insight-custom-element
  - /docs/integrations/web-components/ai-assistant-custom-element
  - /docs/integrations/web-components/web-components-auth
type: docs
description: Understand what the Web Components library is, when to choose it over an iframe or the React library, how it loads, and what limits it has.
weight: 80
section: Integrations
subsection: Web Components
aliases:
  - "../../learn/web_components/"
---

GoodData Cloud and GoodData.CN host a Web Components library that your application loads to embed dashboards, individual visualizations, and the AI Assistant.

The library is a thin wrapper around the [`InsightView`](../../../visualisations/insightview/), `Dashboard`, and `GenAIAssistant` components. Embedding stays simple, and the host application can still integrate closely with the embedded content. In the simplest form, an integration looks like this:

```html
<script type="module" src="https://example.gooddata.com/components/my-workspace-id.js?auth=sso"></script>

<gd-dashboard-embed dashboard="my-dashboard-id"></gd-dashboard-embed>
<gd-insight-embed insight="my-visualization-id" style="display: block; height: 500px"></gd-insight-embed>
```

{{% alert color="info" %}}
The Web Components library runs GoodData.UI under the hood. It loads React and the other dependencies it needs, in an isolated scope that doesn't conflict with other JavaScript in your app.
{{% /alert %}}

## Choosing the right embedding option

GoodData offers several ways to embed analytics: iframe embedding for dashboards, and the GoodData.UI React library for dashboards and visualizations. The Web Components library sits between the two. It's more flexible than an iframe and simpler to integrate than the React library.

### When to use the Web Components library

- You don't want iframe embedding, because of the overhead it creates or because of your company's security and compliance requirements.
- You want to embed a single visualization; iframe embedding works only for a complete dashboard.
- Your host application uses Angular, Vue, or another non-React framework.
- Your application uses a React version that GoodData.UI doesn't support.
- You can't or don't want to install packages from npm, for example on a GoodData.CN deployment in a restricted network. Your GoodData.CN instance serves the library itself; see [How the library loads](#load-the-library).

### When to use an iframe instead

If you want the simplest possible dashboard embedding and don't need deep integration between the host application and the dashboard, an iframe is enough.

An iframe also fits when you want dashboard plugins but can't provide a Module Federation runtime, which `gd-dashboard-embed` needs to load plugins linked to the dashboard. The legacy `gd-dashboard` element doesn't load plugins at all.

### When to use the GoodData.UI React library instead

If the host application is already written in React, use the GoodData.UI React components. They are more flexible, and you avoid loading a second copy of React and ReactDOM.

## How the library loads {#load-the-library}

The library is a JavaScript module that your GoodData instance serves at `/components/<workspace-id>.js`. You load it with a `<script type="module">` tag in the `<head>` of your page; it must be a module script, because the library is distributed as JavaScript modules.

You don't install the library from npm. GoodData hosts it for GoodData Cloud, and on GoodData.CN the `web-components` service serves it. The GoodData.CN Helm chart deploys that service together with the other UI services (`deployUI: true`, the default). The bundle then sits on your own infrastructure under `/components/`, so your application loads GoodData.UI without reaching the npm registry or a public CDN. Its version follows your GoodData.CN release: upgrading GoodData.CN upgrades the library.

The library reads its own URL to configure itself:

- The host must be your GoodData Cloud or GoodData.CN instance. The library loads from that host and also loads your visualization and dashboard data from it, so you can't load the script from one instance and use it with data from another. One page can connect to only one GoodData instance.
- The workspace ID in the file name is the default workspace for your visualizations and dashboards. The `workspace` attribute overrides it for a single element. If your workspace ID collides with another file name in the `/components/` folder, load `/components/index.js?workspace=<workspace-id>` instead.
- The `auth=sso` parameter signs the user in automatically. [Web Components authentication](../web-components-auth/) describes this and the programmatic alternative.

## What the library provides

Once loaded, the library registers these custom elements:

- `<gd-dashboard-embed />` and `<gd-insight-embed />` for [dashboard and visualization embedding](../embed-custom-elements/).
- `<gd-dashboard />` for [dashboard embedding](../dashboard-custom-element/) and `<gd-insight />` for [visualization embedding](../insight-custom-element/), the legacy elements.
- `<gd-ai-assistant />`, and its alias `<gd-ai-chat />`, for [AI Assistant embedding](../ai-assistant-custom-element/), plus `<gd-ai-conversations />` and `<gd-ai-provider />` for [composing the chat from several elements](../ai-assistant-custom-element/#compose-the-chat-from-several-elements).

`gd-dashboard-embed` and `gd-insight-embed` are the elements for new integrations. They render the same components as the legacy `gd-dashboard` and `gd-insight` elements and add JavaScript properties, the `refresh()` and `replaceFilters()` methods, dashboard plugin loading, and the `gd-ready`, `gd-warning`, and `gd-error` events. The legacy elements stay registered for existing integrations.

### Module exports

The script module also exports functions that you import from the same URL:

- `setContext(context)` and `getContext()` set and read the shared context: the backend, the default workspace, and optional Mapbox and AG Grid tokens. See [Web Components authentication](../web-components-auth/).
- `clearCaches(): Promise<void>` clears the visualization cache that `gd-insight-embed` and `gd-insight` read through. The bundle carries its own copy of GoodData.UI, so calling `clearInsightViewCaches()` from your application's own `@gooddata/sdk-ui-ext` dependency has no effect on the embedded elements. Call `clearCaches()` after a visualization was edited elsewhere or when the user changes, and await it before you mount or re-mount any element; otherwise an element can still read the stale cache. The promise rejects if the code chunk fails to load. It doesn't reset the cached workspace permissions.

```html
<script type="module">
    import { clearCaches } from "https://example.gooddata.com/components/my-workspace-id.js";

    await clearCaches();
    // mount or re-mount your gd-insight-embed elements only after this point
</script>
```

## Prerequisites and limitations

### Supported web browsers

The library needs a browser that supports custom elements; it doesn't work in older browsers such as Internet Explorer. See the [Custom Elements browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry#browser_compatibility) table on MDN.

### Cross-origin requests

The script makes requests from your application's origin to the GoodData host, so the organization must allow your origin. See [Allow your origin in production](../../cross-origin-issues/#allow-your-origin-in-production).

### Content Security Policy (CSP)

If your server sends [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) headers, add the GoodData host to the `script-src`, `style-src`, `font-src`, and `img-src` policies. For a GoodData host at `example.gooddata.com`, the policy could look like this:

```text
script-src 'self' 'unsafe-inline' example.gooddata.com;
img-src 'self' data: blob: example.gooddata.com;
style-src 'self' 'unsafe-inline' example.gooddata.com;
font-src 'self' data: example.gooddata.com;
```

### Third-party cookie blocking

The script authenticates its requests to the GoodData host with the GoodData session cookie. When your application runs on a different site than GoodData, the browser treats that cookie as a third-party cookie, and browsers that block third-party cookies make the requests fail even though the user signed in. Serve GoodData from the same site as your application, for example `https://analytics.example.com` next to `https://example.com`. [Cookies across sites](../../authentication/#cookies-across-sites) explains the problem and the other fixes.

### Dashboard plugins

The legacy `gd-dashboard` element doesn't load dashboard plugins. The `gd-dashboard-embed` element does; see [Dashboard plugins](../embed-custom-elements/#dashboard-plugins). Plugins linked to the dashboard on the server need the `moduleFederationIntegration` property; without it, only the plugins you pass through `extraPlugins` load. If you can provide neither, embed the dashboard with an iframe or the React `Dashboard` component.

### CSS class name collisions

The script adds a CSS `<link>` to the `<head>` of your page when it loads. The library's CSS class names can, rarely, collide with your own. If that happens, [open a GitHub issue](https://github.com/gooddata/gooddata-ui-sdk/issues/new).
