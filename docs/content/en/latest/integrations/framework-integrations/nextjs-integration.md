---
legacy_path: architecture/supported_frameworks/nextjs
title: Next.js integration
description: Render GoodData.UI charts in a Next.js App Router application with a client-side backend, the generated catalog, and the GoodData session cookie.
category: Integrations / Framework guides
diataxis_type: howto
related_pages:
  - /docs/data-layer/data-model/export-catalog
  - /docs/integrations/cross-origin-issues
  - /docs/integrations/authentication
  - /docs/integrations/backend-setup
  - /docs/integrations/platform/supported-frameworks
type: docs
weight: 43
section: Integrations
subsection: Framework guides
aliases:
  - "../../architecture/supported_frameworks/nextjs/"
---

GoodData.UI components are React client components, so in a Next.js app they render on the client. This guide adds them to a Next.js App Router project: it installs the packages, generates the catalog of measures and attributes, creates the backend, and renders a bar chart.

## Install the packages

Install the backend connector, the core UI package, the data model, and the charts:

```bash
npm install @gooddata/sdk-backend-tiger @gooddata/sdk-ui @gooddata/sdk-model @gooddata/sdk-ui-charts
```

[Installation](../../../getting-started/installation/#install-the-packages) lists the other component packages. `@gooddata/sdk-ui-all` re-exports the model, core UI, charts, geo, pivot, filters, and `InsightView` packages in one dependency, but not `@gooddata/sdk-ui-dashboard` or the AI packages.

Add the catalog-export tool as a dev dependency. It generates a TypeScript file with a constant for every measure, attribute, and fact in your workspace:

```bash
npm install --save-dev @gooddata/catalog-export
```

## Configure catalog-export

Add a `gooddata` block and a `refresh-md` script to `package.json`:

```json
{
    "gooddata": {
        "hostname": "https://<your-gooddata-host>",
        "workspaceId": "<workspace-id>",
        "catalogOutput": "app/catalog.ts"
    },
    "scripts": {
        "refresh-md": "gdc-catalog-export"
    }
}
```

## Export the catalog

`catalog-export` reads an API token from the `TIGER_API_TOKEN` environment variable or from a `.env` file in the project root. See [Create an API token](https://www.gooddata.ai/docs/cloud/manage-organization/user-token/). Keep `.env` out of version control:

```bash
echo "TIGER_API_TOKEN=<your-api-token>" >> .env
npm run refresh-md
```

The command writes the constants to `app/catalog.ts`. Run it again whenever the workspace's logical data model (LDM) changes.

The token stays on your machine: Next.js exposes only variables prefixed with `NEXT_PUBLIC_` to client code, so `TIGER_API_TOKEN` never reaches the browser bundle.

## Allow your app's origin

The Next.js app runs on a different origin than GoodData, so add its origin, for example `https://app.example.com` or `http://localhost:3000`, to your organization's allowed origins. See [Allow your origin in production](../../cross-origin-issues/#allow-your-origin-in-production).

## Create the backend

Create the backend in a client module. `ContextDeferredAuthProvider` uses the session cookie the browser gets when the user signs in to GoodData, and `redirectToTigerAuthentication` sends the user to the GoodData sign-in when the session is missing:

```ts
// app/backend.ts
"use client";

import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";

export const backend = tigerFactory()
    .onHostname("https://<your-gooddata-host>")
    .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));
```

Don't put an API token into a `NEXT_PUBLIC_` variable for a production build: the value is written into the JavaScript bundle, and anyone who loads the page can reuse it. If the browser blocks the GoodData cookie because your app runs on another site, or your own portal signs users in, use a JSON Web Token instead. [Authenticate to the backend](../../authentication/) covers both cases.

## Import the styles

Import the stylesheets of the packages you installed in `app/layout.tsx`:

```tsx
// app/layout.tsx
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
```

## Render a chart

Put the providers and the chart in a client component:

```tsx
// app/gooddata-chart.tsx
"use client";

import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { backend } from "./backend.js";
import * as Md from "./catalog.js";

export function GoodDataChart() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<workspace-id>">
                <div style={{ height: 400 }}>
                    <BarChart measures={[Md.YourFact.Sum]} viewBy={[Md.YourAttribute.Default]} />
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

The constant names come from your workspace, so `Md.YourFact` and `Md.YourAttribute` stand in for whatever `catalog-export` generated. Charts fill their container, so give the wrapper a height.

Render the component from a page:

```tsx
// app/page.tsx
import { GoodDataChart } from "./gooddata-chart.js";

export default function Page() {
    return <GoodDataChart />;
}
```

## Run the application

Start the development server and open the page:

```bash
npm run dev
```

If the chart stays empty and the browser console shows a CORS error, check the allowed origins. If it shows `NotAuthenticated`, check the authentication setup in [Authenticate to the backend](../../authentication/#troubleshooting).
