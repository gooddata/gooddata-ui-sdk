---
legacy_path: learn/integrate_and_authenticate/cross_origin_issues
title: Resolve cross-origin errors
description: Resolve CORS errors between your app and GoodData Cloud or GoodData.CN by proxying the API through your dev server or allowing your origin in production.
category: Integrations
diataxis_type: howto
related_pages:
  - /docs/integrations/backend-setup
  - /docs/integrations/authentication
  - /docs/getting-started/quickstart
  - /docs/dashboard-plugins/develop-your-first-plugin
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 14
section: Integrations
aliases:
  - "../learn/integrate_and_authenticate/cross_origin_issues/"
---

The browser blocks a request when your app's origin differs from the GoodData origin and GoodData hasn't allowed that origin. You'll see it the moment an app on `http://localhost:3000` calls `https://your-org.cloud.gooddata.com` — the request fails with a CORS error, even though the same URL works when you paste it into the address bar. This is the browser's [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) at work.

There are two fixes, one per environment:

- **In development, proxy the API through your dev server.** The browser sees a single origin, so no cross-origin request happens and no GoodData-side configuration is needed.
- **In production, allow your app's origin on the GoodData side.** Add the origin to your organization's CORS settings.

Loading a dashboard plugin from your own host is the reverse direction: the GoodData dashboard requests files from your server, so your host needs the CORS headers instead. See [Host the plugin](../../dashboard-plugins/develop-your-first-plugin/#host-the-plugin).

## Proxy the API in development

Your dev server forwards every request under `/api` to your GoodData host. As far as the browser is concerned the API lives at `http://localhost:3000/api`, so the request is same-origin and never triggers a preflight.

For this to work, the backend must build origin-relative URLs. Create it without `onHostname`:

```ts
import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";

// no onHostname() — requests go to the dev server, which proxies them
export const backend = tigerFactory().withAuthentication(
    new ContextDeferredAuthProvider(redirectToTigerAuthentication),
);
```

If you scaffolded your app with `@gooddata/app-toolkit`, this proxy is already configured — see [Quick start](../../getting-started/quickstart/).

### Vite

Add a `server.proxy` entry to `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const BACKEND_URL = "https://public-examples.gooddata.com";
// Everything that has to reach the backend rather than the dev server.
const BACKEND_ENDPOINTS = "^/(api/|gdc/|account\\.html|truste\\.html|account/)";

export default defineConfig(({ mode }) => {
    // the third argument loads every variable, not just the VITE_-prefixed ones
    const env = loadEnv(mode, process.cwd(), "");
    const apiToken = env["TIGER_API_TOKEN"];

    return {
        plugins: [react()],
        server: {
            port: 3000,
            // Vite's dev server allows any origin by default. The proxy below injects your API token into
            // every backend request, so leaving CORS on would let any other page on localhost ride that
            // token through your dev server. Turn it off.
            cors: false,
            proxy: {
                [BACKEND_ENDPOINTS]: {
                    target: BACKEND_URL,
                    changeOrigin: true,
                    // An empty string strips the cookie's Domain attribute, so the browser stores a host-only
                    // cookie valid for whichever of 127.0.0.1 / localhost you opened the dev server on.
                    cookieDomainRewrite: "",
                    secure: false,
                    headers: {
                        // The literal string "null" is the serialized opaque origin. Setting it here, rather
                        // than stripping the header in a proxyReq callback, also covers requests http-proxy
                        // skips that callback for (any request carrying `Expect: 100-continue`).
                        origin: "null",
                        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
                    },
                },
            },
        },
    };
});
```

### webpack

Add a `devServer.proxy` entry to `webpack.config.cjs`. `webpack-dev-server` 5 takes an array of proxy rules:

```js
require("dotenv").config();

const BACKEND_URL = "https://public-examples.gooddata.com";
// Everything that has to reach the backend rather than the dev server.
const BACKEND_ENDPOINTS = /^\/(api\/|gdc\/|account\.html|truste\.html|account\/)/;
const apiToken = process.env.TIGER_API_TOKEN;

module.exports = {
    // ...the rest of your configuration
    devServer: {
        host: "127.0.0.1",
        port: 3000,
        proxy: [
            {
                context: (pathname) => BACKEND_ENDPOINTS.test(pathname),
                target: BACKEND_URL,
                changeOrigin: true,
                // An empty string strips the cookie's Domain attribute, so the browser stores a host-only
                // cookie valid for whichever of 127.0.0.1 / localhost you bind the dev server to.
                cookieDomainRewrite: "",
                secure: false,
                headers: {
                    // The literal string "null" is the serialized opaque origin. Setting it here, rather
                    // than stripping the header in an onProxyReq callback, also covers requests http-proxy
                    // skips that callback for (any request carrying `Expect: 100-continue`).
                    origin: "null",
                    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
                },
            },
        ],
    },
};
```

Both configurations use the same options:

- `changeOrigin` rewrites the `Host` header to the target host, so GoodData sees a request addressed to itself.
- `cookieDomainRewrite: ""` strips the session cookie's `Domain` attribute, so the browser stores a host-only cookie that works no matter which of `127.0.0.1`/`localhost` you bind the dev server to — no need to keep it in sync with your dev server's host.
- `secure: false` accepts a self-signed certificate, which you need when proxying to a local GoodData.CN instance.
- Setting `headers.origin` to the string `"null"` stops the forwarded request from still advertising your dev server, which GoodData would read as cross-origin. Setting it as a static header, rather than removing it in a `proxyReq`/`onProxyReq` callback, also covers requests where the underlying `http-proxy` library skips that callback (any request carrying `Expect: 100-continue`).
- The proxy path pattern covers more than `/api` — GoodData Cloud and GoodData.CN also serve some endpoints under `/gdc/`, `/account/`, `/account.html`, and `/truste.html`.

{{% alert color="warning" title="cors: false is Vite-specific" %}}
Vite's dev server allows any origin by default, which would let any other page on `localhost` ride your injected API token through the proxy — hence `cors: false` in the Vite example above. `webpack-dev-server` doesn't enable permissive CORS by default, so it needs no equivalent setting.
{{% /alert %}}

{{% alert color="warning" title="The API token is for development only" %}}
Injecting `Authorization` in the proxy keeps the token out of your bundle, but it's still a token with your permissions on a machine you control. Keep it in `.env`, keep `.env` out of version control, and never carry this proxy into production — deploy with a real authentication flow instead. See [Authenticate to the backend](../authentication/).
{{% /alert %}}

{{% alert color="warning" title="Geo charts need one more rule" %}}
`GeoChart` and `GeoPushpinChart` load map glyphs and tiles from URLs returned by `/api/v1/location/style`. Those URLs are absolute and point at the GoodData host, so MapLibre fetches them cross-origin and the map stays blank. A working proxy has to intercept that response and rewrite its URLs to the dev-server origin. The `vite.config.ts` that `npx @gooddata/app-toolkit@latest init` generates already does this — start from it rather than writing the rewrite yourself. See [Quick start](../../getting-started/quickstart/).
{{% /alert %}}

## Allow your origin in production

A deployed app can't proxy its way around CORS, so add its origin to your organization's allowlist.

### GoodData Cloud

Configure CORS in the settings of your GoodData Cloud instance. If your instance is at `https://example.com`, the settings are at `https://example.com/settings`; you can also reach the page from your instance's home page. You can set the same `allowedOrigins` attribute through the organization API.

For the accepted origin formats and the API call, see [Set up CORS for an organization](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-cors-for-organization/).

### GoodData.CN

Set `allowedOrigins` on the organization the same way you would in GoodData Cloud. The GoodData.CN All-in-One image is already configured to allow cross-origin requests from an application running on `https://localhost:8443`, so a local development setup needs no change.

{{% alert color="info" title="CORS is not authentication" %}}
An allowed origin lets the request through; it doesn't make the request authenticated. Configure authentication separately — see [Authenticate to the backend](../authentication/) for API token and context-deferred flows.
{{% /alert %}}
