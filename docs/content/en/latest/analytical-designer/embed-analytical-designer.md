---
title: Embed Analytical Designer
description: Install @gooddata/sdk-ui-analytical-designer, load its styles, and render Analytical Designer on your backend in a React application.
diataxis_type: howto
type: docs
weight: 2
api_symbols:
  - "@gooddata/sdk-ui-analytical-designer:AnalyticalDesigner"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerCacheReset"
source_files:
  - src/embedding/AnalyticalDesigner.tsx
  - styles/scss/main.scss
related_pages:
  - /docs/analytical-designer/analytical-designer
  - /docs/analytical-designer/handle-analytical-designer-events
  - /docs/analytical-designer/customize-analytical-designer
  - /docs/integrations/authentication
  - /docs/integrations/embedding/embed-dashboards
section: Analytical Designer
category: Analytical Designer
ai_generated_body: true
---

When you finish, your React application renders Analytical Designer on its own backend instance, with the Analytical Designer styles and a cache that stays fresh when the user refreshes the catalog or edits a metric.

You need a React application with a GoodData backend set up. See [Authenticate to the backend](../../integrations/authentication/).

## Install the package

The package has the version of the GoodData.UI release it was built with. Install it at the GoodData.UI version your application uses, with the `@gooddata/sdk-*` packages at the same version:

```bash
npm install @gooddata/sdk-ui-analytical-designer@<sdk-version> \
    @gooddata/sdk-backend-base@<sdk-version> \
    @gooddata/sdk-backend-spi@<sdk-version> \
    @gooddata/sdk-backend-tiger@<sdk-version> \
    @gooddata/sdk-ui@<sdk-version>
```

`react` and `react-dom` 18 or later are peer dependencies.

With the same version, your application and Analytical Designer share one copy of each SDK package. They share its React contexts, and your bundle contains one SDK. Analytical Designer also runs next to another SDK version, because it mounts its own backend, workspace, and theme providers, but then the bundle contains two SDK copies.

## Import the styles

Importing the package loads no stylesheet. Import the SDK stylesheets Analytical Designer needs, then `main.css`, once, in the module that loads Analytical Designer. Keep this order, so the Analytical Designer rules win over the SDK rules:

```ts
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";
import "@gooddata/sdk-ui-filters/styles/css/dateFilter.css";
import "@gooddata/sdk-ui-filters/styles/css/rankingFilter.css";
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-semantic-search/styles/css/internal.css";
import "@gooddata/sdk-ui-analytical-designer/styles/css/main.css";
```

If your application already loads the SDK stylesheets, import only `main.css`.

`main.css` sets no page-level rules. Headings, paragraphs, and form controls are styled only inside the Analytical Designer root element. Your page reset, your `html` and `body` styles, and the dialogs that Analytical Designer opens in `document.body` keep your typography.

## Set up the backend

Analytical Designer runs on your backend instance. If the backend caches, keep its `CacheControl` and give Analytical Designer the resets, so that the catalog **Refresh** button and a metric edit load fresh data:

```ts
// backend.ts
import {
    type CacheControl,
    RecommendedCachingConfiguration,
    withCaching,
} from "@gooddata/sdk-backend-base";
import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";
import { type IAnalyticalDesignerCacheReset } from "@gooddata/sdk-ui-analytical-designer";

let cacheControl: CacheControl | undefined;

export const backend = withCaching(
    tigerFactory()
        .onHostname("https://example.gooddata.com")
        .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication)),
    {
        ...RecommendedCachingConfiguration,
        onCacheReady: (control) => {
            cacheControl = control;
        },
    },
);

export const cacheReset: IAnalyticalDesignerCacheReset = {
    resetAll: () => cacheControl?.resetAll(),
    resetCatalogs: () => cacheControl?.resetCatalogs(),
};
```

## Render the component

Render `AnalyticalDesigner` inside a `BackendProvider` and a `WorkspaceProvider`, or pass `backend` and `workspace` to it. Analytical Designer fills its container, so give the container a height:

```tsx
// App.tsx
import { AnalyticalDesigner } from "@gooddata/sdk-ui-analytical-designer";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { backend, cacheReset } from "./backend.js";
import "./styles.js"; // the stylesheet imports from the previous step

export function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<workspace-id>">
                <div style={{ height: "100vh" }}>
                    <AnalyticalDesigner
                        insight="<visualization-id>"
                        config={{ locale: "en-US" }}
                        cacheReset={cacheReset}
                        onEvent={(event) => {
                            if (event.type === "visualizationSaved") {
                                console.log("saved", event.data.insight);
                            }
                        }}
                        onError={(error) => console.error("Analytical Designer cannot start", error)}
                    />
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

Leave out `insight` to open an empty editor for a new visualization.

{{% alert color="warning" title="One instance per page" %}}
Mounting a second `AnalyticalDesigner` while one is mounted throws an error. Unmount the first one before you mount another.
{{% /alert %}}

Analytical Designer needs no bundler configuration in Vite or webpack. The metric editor ships its worker bundled with the package.

Where to go next:

- [Handle Analytical Designer events](../handle-analytical-designer-events/) – react to saves and cancellations, and send commands.
- [Customize Analytical Designer](../customize-analytical-designer/) – hide actions, filter the catalog, theme it, and replace its loading and error screens.
