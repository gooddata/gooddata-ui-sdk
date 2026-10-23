---
title: Installation
description: Add GoodData.UI to an existing React application by installing the
  packages, importing the styles, connecting the analytical backend, and
  rendering a dashboard your users pick from a list.
category: Getting Started
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui:BackendProvider"
  - "@gooddata/sdk-ui:WorkspaceProvider"
  - "@gooddata/sdk-backend-tiger:tigerFactory"
  - "@gooddata/sdk-backend-tiger:ContextDeferredAuthProvider"
  - "@gooddata/sdk-ui-dashboard:Dashboard"
related_pages:
  - /docs/getting-started/quickstart
  - /docs/integrations/authentication
  - /docs/integrations/cross-origin-issues
  - /docs/dashboard-plugins/dashboard
  - /docs/getting-started/platform-compatibility
type: docs
weight: 1
section: Getting Started
---

GoodData.UI is distributed as npm packages under the `@gooddata` scope. This guide adds them to a React project you already have and ends with a dashboard on screen, chosen from a list of the dashboards in your workspace. Starting from scratch? The [Quick start](../quickstart/) scaffolds a working app in one command instead.

## Check the prerequisites

- **Node.js** `>=24.12.0` (an LTS release is recommended)
- **React** 18 or 19
- **TypeScript** 5.8.3 or newer
- A bundler that resolves ES modules. The packages are [ES modules only](../../integrations/platform/esm-only/) and have no CommonJS build
- A **GoodData Cloud** or **GoodData.CN** workspace, and its hostname

Using GoodData Legacy (the deprecated GoodData Platform)? Stay on GoodData.UI version 9. [Platform compatibility](../platform-compatibility/) explains why.

## Install the packages

{{% alert color="info" %}}
No access to npm? On GoodData.CN, your own deployment already serves GoodData.UI as the Web Components library, so you
can embed dashboards and visualizations without installing any package. See
[Web Components overview](../../integrations/web-components/web-components-overview/#load-the-library).
{{% /alert %}}

Every GoodData.UI app needs the backend connector, the core UI package, and the data model:

```bash
npm install @gooddata/sdk-backend-tiger @gooddata/sdk-ui @gooddata/sdk-model
```

Then add the packages for the components you plan to render. Install only what you use, because each one brings its own stylesheet and bundle weight:

```bash
# Dashboard: renders a whole saved dashboard
npm install @gooddata/sdk-ui-dashboard

# Charts: BarChart, PieChart, LineChart, ...
npm install @gooddata/sdk-ui-charts

# Pivot table
npm install @gooddata/sdk-ui-pivot

# InsightView: renders any visualization saved in your workspace
npm install @gooddata/sdk-ui-ext

# Attribute, date, measure-value, and ranking filters
npm install @gooddata/sdk-ui-filters

# Shared UI primitives (buttons, dropdowns, overlays) the packages above rely on
npm install @gooddata/sdk-ui-kit
```

If you prefer a single dependency, `@gooddata/sdk-ui-all` re-exports `@gooddata/sdk-model`, `@gooddata/sdk-backend-spi`, `@gooddata/sdk-ui`, and the charts, geo, pivot, filters, and `InsightView` packages. It does not include `@gooddata/sdk-ui-dashboard` or the AI packages, so install those separately.

## Import the styles

The components ship CSS you have to import once, typically in your app's entry file. Import only the packages you installed:

```tsx
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";
```

## Connect the backend

Create one analytical backend instance and hand it to the whole component tree through `BackendProvider`. `WorkspaceProvider` names the workspace whose data you render. Every GoodData.UI component reads both from React context, so you set them up once at the root:

```tsx
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";

// The browser already holds a GoodData session (SSO, or you are signed in to GoodData Cloud).
// When your app is served from a different origin than GoodData, call onHostname first:
// tigerFactory().onHostname("https://your-instance.gooddata.com").withAuthentication(...)
// and allow your app's origin in the CORS settings.
const backend = tigerFactory().withAuthentication(
    new ContextDeferredAuthProvider(redirectToTigerAuthentication),
);

export function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<workspace-id>">
                <Analytics />
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

`ContextDeferredAuthProvider` is the right choice for production apps. It expects the user to be signed in already, and `redirectToTigerAuthentication` sends them to the GoodData sign-in flow when they aren't. [Authenticate to the backend](../../integrations/authentication/) covers the other options, such as API tokens during development and JWT. If your app runs on a different origin than GoodData, read [Resolve cross-origin errors](../../integrations/cross-origin-issues/) for the dev server proxy and the production CORS setup.

## Render a dashboard your users pick

Most embedded apps don't hardcode a dashboard id. They ask the workspace which dashboards exist, show the titles in a sidebar or a menu, and render whichever one the user picks. The same `backend` you created above exposes that list, and the `Dashboard` component accepts the picked identifier as a plain string.

`useBackendStrict` and `useWorkspaceStrict` read the two providers from context. `useCancelablePromise` is the SDK's small hook for async calls in components. It tracks loading and error state and cancels the call if the component unmounts. Swap in your own data-fetching library if you already use one.

```tsx
import { useState } from "react";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

export function Analytics() {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const [selectedId, setSelectedId] = useState<string>();

    const { result: dashboards, status, error } = useCancelablePromise(
        { promise: () => backend.workspace(workspace).dashboards().getDashboards() },
        [backend, workspace],
    );

    if (status === "error") {
        return <div>Could not load dashboards: {String(error)}</div>;
    }
    if (status !== "success") {
        return <div>Loading dashboards...</div>;
    }

    const currentId = selectedId ?? dashboards[0]?.identifier;

    return (
        <div className="analytics">
            <nav className="analytics-sidebar">
                {dashboards.map((dashboard) => (
                    <button
                        key={dashboard.identifier}
                        type="button"
                        onClick={() => setSelectedId(dashboard.identifier)}
                        aria-current={dashboard.identifier === currentId}
                    >
                        {dashboard.title}
                    </button>
                ))}
            </nav>
            <main className="analytics-content">
                {currentId ? <Dashboard dashboard={currentId} /> : <p>No dashboards in this workspace yet.</p>}
            </main>
        </div>
    );
}
```

Each entry in the list has an `identifier`, a `title`, and a `description`, so you can build whatever navigation fits your app. Store the selected id in your router or global state if the dashboard should survive a page reload.

The `Dashboard` component brings the whole thing: layout, filter bar, widgets, drilling, and exports. The [Dashboard component](../../dashboard-plugins/dashboard/) page lists every prop, and [Embed dashboards](../../integrations/embedding/embed-dashboards/) shows how to react to its events and tune what it shows.

## Optional: typed references with the metadata catalog

When you build charts in code rather than rendering saved ones, you reference measures and attributes by id. `@gooddata/catalog-export` can generate a TypeScript file with a typed constant for each object in your workspace, so a mistyped id fails at compile time:

```tsx
import { BarChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

export function Revenue() {
    return <BarChart measures={[Md.Revenue]} viewBy={Md.Product.Default} />;
}
```

The constant names come from your workspace, so `Md.Revenue` and `Md.Product.Default` stand in for whatever the exporter generated for you. Install the tool as a dev dependency, describe your workspace in a `gooddata` block in `package.json`, and give it an API token through the `TIGER_API_TOKEN` environment variable. [Export catalog](../../data-layer/data-model/export-catalog/) has the setup and the [Quick start](../quickstart/#look-around-the-project) shows it wired into a project.

## Next steps

- The [Quick start](../quickstart/) shows the same setup in a scaffolded app, then renders a chart built in code and reads raw data.
- [Integrate into an existing application](../../integrations/backend-setup/) is the long version of this page, including production CORS and authentication.
- [Apply theming](../../integrations/embedding/apply-theming/) makes the embedded dashboard match your app.
- [Visualizations](../../visualisations/) helps you pick a component when one chart is enough.
