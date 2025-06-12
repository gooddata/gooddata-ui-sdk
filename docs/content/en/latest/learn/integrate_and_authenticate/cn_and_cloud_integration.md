---
title: Integrate CN and Cloud into an Existing Application
linkTitle: CN and Cloud Integration
copyright: (C) 2007-2021 GoodData Corporation
weight: 11
---

This document outlines the important steps you need to undertake if you need to integrate GoodData.UI into an existing
React application or for some reason you cannot use [@gooddata/apptoolkit](../../../quick_start/) to bootstrap a new application.

## Step 1. Install the necessary dependencies

For GoodData Cloud and GoodData.CN, you need to install packages codenamed `tiger`:

```bash
yarn add @gooddata/api-client-tiger @gooddata/sdk-backend-tiger
```

On top of this, you can pick and choose packages depending on which GoodData.UI components you plan to use. For more information, see the table included in the [architecture overview](../../../architecture/architecture_overview/).

-   If you plan to use only headless React components and essential infrastructure, install:

    ```bash
    yarn add @gooddata/sdk-ui
    ```

-   If you plan to use all available GoodData.UI visualizations, install:

    ```bash
    yarn add @gooddata/sdk-ui-charts @gooddata/sdk-ui-pivot @gooddata/sdk-ui-geo @gooddata/sdk-ui-ext
    ```

-   If you plan to use all components of GoodData.UI, install:

    ```bash
    yarn add @gooddata/sdk-ui-all
    ```

We also highly recommend that you use the [catalog-export](../../visualize_data/export_catalog/) tool to generate a file with
code representation of all available measures and attributes in your GoodData Cloud or GoodData.CN workspace. You can then use this
generated code to specify what data to render in the visual components. To add `@gooddata/catalog-export` as a dev dependency, execute the following command:

```bash
yarn add --dev @gooddata/catalog-export
```

## Step 2. Include styles

GoodData.UI uses CSS to style the components. Each package whose name is prefixed with `sdk-ui` contains CSS files that you need to include or import in your application. The following list shows all the possible imports you may need:

```jsx
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
```

Make sure to import the styles only from the packages that you actually use.

**NOTE**: `@gooddata/sdk-ui-kit` is a library of elementary components (buttons, dropdowns, overlays) required by different GoodData.UI components. The best practice is to import all their CSS files and eventually remove those that make the application build fail.

## Step 3. Set up Analytical Backend and integrate it into your application

All integration and communication of GoodData.UI React components and GoodData happens via the **Analytical Backend** abstraction. Your application should initialize an instance of the Analytical Backend as soon as possible as follows:

```javascript
import tigerFactory, {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
} from "@gooddata/sdk-backend-tiger";

const backend = tigerFactory().withAuthentication(
    new ContextDeferredAuthProvider(redirectToTigerAuthentication),
);

// or if your application will be hosted on a different host than the GoodData Cloud or GoodData.CN backend
const backend = tigerFactory()
    .onHostname("https://example.com") // this should be the domain where the GoodData Cloud or GoodData.CN is hosted
    .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));
```

Depending on the type and style used in your application, you can either store an instance of `backend` in a read-only global
variable or use React contexts.

This is how you can set contexts that hold both an instance of the Analytical Backend and the identifier of the GoodData workspace that you are targeting:

```jsx
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<your-workspace-identifier>">
                <YourApp />
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

**NOTE**: If you are building a React application, the contexts are the best way to go. All GoodData.UI components
are context-aware and will retrieve both `backend` and `workspace` to use.

## Step 4. Solve Cross-Origin Resource Sharing

The interaction with third-party APIs and services from the browser is protected by the [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) mechanism (CORS). Correct CORS setup is mainly a server-side concern.

### GoodData Cloud

To configure the CORS settings, use the UI on your GoodData Cloud instance. For example, if your GoodData Cloud instance is on `https://example.com`, the UI for CORS configuration is on `https://example.com/settings`. You can also reach this page from the home page of your GoodData Cloud instance.

### GoodData.CN

The GoodData.CN All-in-One image is already configured to allow cross-origin requests coming from a GoodData.UI
application running on `https://localhost:8443`.

## Step 5. Configure authentication

You may have noticed that the code snippet in [Step 3](#step-3.-set-up-analytical-backend-and-integrate-it-into-your-application) set up authentication to use `ContextDeferredAuthProvider`. This effectively tells the Analytical Backend that your application takes care of handling setup of the authenticated session to GoodData Cloud or GoodData.CN.

In this particular example, when the session is not authenticated, your application uses the built-in `redirectToTigerAuthentication` function to redirect the browser window to a location where the GoodData Cloud or GoodData.CN authentication flow starts.

If your application is running in a Federated Identity Management context, you need to propagate the current user's identity provider ID to the redirect handler. To do that, you can use the `createRedirectToTigerAuthenticationWithParams` factory with the identity provider ID as a parameter and use its result instead of the generic `redirectToTigerAuthentication` handler.

Once redirected to this location, the GoodData Cloud or GoodData.CN server starts the OpenID Connect (OIDC) authentication flow according to its
configuration. Once the flow finishes, the server replies with a redirect response that will take the browser back to your application window.

The configuration listed in [Step 3](#step-3.-set-up-analytical-backend-and-integrate-it-into-your-application) is the recommended configuration for the production deployment where the application is served either from the same origin as GoodData Cloud or GoodData.CN or from a different origin with correct CORS and authentication cookies configuration.

## Next steps

At this point, your application should be set to use GoodData.UI and render visualizations from GoodData. If you
also configured and run the [catalog-export](../../visualize_data/export_catalog/) tool, you can now start embedding visualizations
into your application:

```jsx
import { LineChart } from "@gooddata/sdk-ui-charts";
import { YourFact, YourMeasure, YourAttribute } from "./generatedMd";

function MyVisualization() {
    const measures = [YourFact.Sum, YourMeasure];
    const attributes = [YourAttribute.DisplayFormName];

    return <LineChart measures={measures} trendBy={attribute} />;
}
```

**NOTE:** The imports from `generatedMd` are for illustration purposes. You can name the file with the generated LDM as you see fit and store it in any location. The names of constants in the generated file will reflect the facts, measures, and attributes in your workspace.

Here are some suggestions about what you can do after you created your first visualization:

-   Add more elements: tables, charts, custom visualizations. For more information, see [Visual Components](../../../references/visual_components/).
-   [Enable drilling](../../add_interactivity/drillable_items/).
-   Add a [customizable theme](../../apply_theming/) to your application.
