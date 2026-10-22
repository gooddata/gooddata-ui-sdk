---
legacy_path: learn/integrate_and_authenticate/cn_and_cloud_integration
title: Integrate into an existing application
category: Integrations
diataxis_type: howto
related_pages:
  - /docs/getting-started/installation
  - /docs/integrations/authentication
  - /docs/integrations/cross-origin-issues
  - /docs/integrations/hooks/use-backend
  - /docs/getting-started/platform-compatibility
type: docs
description: Add GoodData.UI to an existing React application by installing packages and styles, configuring backend and workspace contexts, CORS, and authentication.
weight: 11
section: Integrations
aliases:
  - "../learn/integrate_and_authenticate/cn_and_cloud_integration/"
---

Use this guide to add GoodData.UI to an existing React application, or to set up a new one when you can't scaffold it with [`@gooddata/app-toolkit`](../../getting-started/quickstart/). It covers the packages, the styles, the backend, and the pieces that production needs on top: cross-origin requests and authentication.

## Install the packages

Install the backend connector, the core UI package, and the data model:

```bash
npm install @gooddata/sdk-backend-tiger @gooddata/sdk-ui @gooddata/sdk-model
```

Then add the packages for the components you plan to render, for example `@gooddata/sdk-ui-charts` for charts or `@gooddata/sdk-ui-dashboard` for whole dashboards. [Installation](../../getting-started/installation/#install-the-packages) lists every component package, and the [architecture overview](../platform/architecture-overview/) explains what each one contains.

If you prefer a single dependency, `@gooddata/sdk-ui-all` re-exports `@gooddata/sdk-model`, `@gooddata/sdk-backend-spi`, `@gooddata/sdk-ui`, and the charts, geo, pivot, filters, and `InsightView` packages. It doesn't include `@gooddata/sdk-ui-dashboard` or the AI packages, so install those separately.

To reference measures and attributes in code with typed constants, also add the [catalog-export](../../data-layer/data-model/export-catalog/) tool. It generates a file with a constant for every measure, attribute, and fact in your GoodData Cloud or GoodData.CN workspace:

```bash
npm install --save-dev @gooddata/catalog-export
```

## Import the styles

Each `@gooddata/sdk-ui-*` package ships a stylesheet. Import the ones for the packages you installed, once, in your app's entry file:

```ts
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
```

`@gooddata/sdk-ui-kit` holds the shared buttons, dropdowns, and overlays that the other packages use, so keep its stylesheet whenever you use any of them.

## Create the backend

GoodData.UI components talk to GoodData through the analytical backend. Create one instance as early as possible:

```ts
import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";

export const backend = tigerFactory()
    .onHostname("https://example.gooddata.com") // where GoodData Cloud or GoodData.CN runs
    .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));
```

Leave out `onHostname` only when your app is served from the same origin as GoodData, or when a dev server proxies the API for you.

## Provide the backend and workspace

Put the backend and the identifier of your GoodData workspace into React context. Every GoodData.UI component reads both from there:

```tsx
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { backend } from "./backend.js";

export function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<workspace-id>">
                <YourApp />
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

## Allow cross-origin requests

When your app runs on a different origin than GoodData, the browser blocks its requests until GoodData allows that origin. In development, proxy the API through your dev server; in production, add your origin to the organization's CORS settings. [Resolve cross-origin errors](../cross-origin-issues/) has both setups.

## Set up authentication

`ContextDeferredAuthProvider` with `redirectToTigerAuthentication` uses the GoodData session cookie: when the session is missing, it redirects the browser to the GoodData sign-in flow and back. This is the recommended setup for production apps served from the same site as GoodData, or from another origin with CORS configured.

For a JSON Web Token from your own portal, an API token for local development, or Federated Identity Management, see [Authenticate to the backend](../authentication/).

## Render a visualization

With the catalog exported, build a chart from the generated constants:

```tsx
import { LineChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

export function MyVisualization() {
    return <LineChart measures={[Md.YourFact.Sum, Md.YourMetric]} trendBy={Md.YourAttribute.Default} />;
}
```

The constant names come from your workspace, so `Md.YourFact`, `Md.YourMetric`, and `Md.YourAttribute` stand in for whatever `catalog-export` generated. A fact has one constant per aggregation (`Sum`, `Avg`, and so on), and an attribute's default display form is `Default`.

## Next steps

- Add more tables, charts, and custom visualizations. See [Visualizations](../../visualisations/).
- [Make visualizations drillable](../interactivity/drillable-items/).
- [Apply a theme](../embedding/apply-theming/) to match your app.
