---
title: Integrate Platform into an Existing Application
linkTitle: Platform Integration
copyright: (C) 2007-2018 GoodData Corporation
weight: 30
---

> This arcticle is for [GoodData Platform](https://help.gooddata.com/doc/enterprise/en/expand-your-gooddata-platform/gooddata-platform-overview/) only.

This document outlines the important steps you need to undertake if you need to integrate GoodData.UI into an existing
React application or for some reason you cannot use [@gooddata/apptoolkit](../../../quick_start/) to bootstrap a new application.

## Step 1. Install the necessary dependencies

GoodData.UI can target multiple platforms. Therefore, it is essential to install packages for the right target platform. For the
GoodData platform, you need to install packages codenamed `bear`:

```bash
yarn add @gooddata/api-client-bear @gooddata/sdk-backend-bear @gooddata/sdk-model
```

On top of this, you can pick and choose packages depending on which GoodData.UI components you plan to use. For more information, see the table in the [architecture overview](../../../architecture/architecture_overview/).

-  If you plan to use only headless React components and essential infrastructure, install:

   ```bash
   yarn add @gooddata/sdk-ui
   ```

-  If you plan to use all available GoodData.UI visualizations, install:

   ```bash
   yarn add @gooddata/sdk-ui-charts @gooddata/sdk-ui-pivot @gooddata/sdk-ui-geo @gooddata/sdk-ui-ext
   ```

-  If you plan to use all components of GoodData.UI, install:

   ```bash
   yarn add @gooddata/sdk-ui-all
   ```

We also highly recommend that you use the [catalog-export](../../visualize_data/export_catalog/) tool to generate a file with
code representation of all available measures and attributes in your GoodData platform workspace. You can then use this
generated code to specify what data to render in the visual components. To add `@gooddata/catalog-export` as a dev dependency, execute the following command:

```bash
yarn add --dev @gooddata/catalog-export
```

## Step 2. Include styles

GoodData.UI uses CSS to style the components. Each package whose name is prefixed with `sdk-ui` contains
CSS files that you need to include or import in your application. The following list shows all the possible imports that you may need:

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

All integration and communication of the GoodData.UI React components and the GoodData platform happen via the **Analytical Backend** abstraction.
Your application should initialize an instance of the Analytical Backend as soon as possible as follows:

```javascript
import bearFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-bear";

const backend = bearFactory().withAuthentication(new ContextDeferredAuthProvider());

// or if your application will be hosted on a different host than the GoodData platform
const backend = bearFactory()
    .onHostname("https://example.com") // this should be the domain where the GoodData platform is hosted
    .withAuthentication(new ContextDeferredAuthProvider());
```

Depending on the type and style used in your application, you can either store an instance of `backend` in a read-only global
variable or use React contexts.

This is how you can set contexts that hold both an instance of the Analytical Backend and the identifier of the GoodData platform workspace that you are targeting:

```jsx
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="<your-workspace-identifier>">
                <YourApp/>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

**NOTE**: If you are building a React application, the contexts are the best way to go. All GoodData.UI components
are context-aware and will retrieve both `backend` and `workspace` to use.

## Step 4. Solve Cross-Origin Resource Sharing

The interaction with third-party APIs and services from the browser is protected by the [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) mechanism (CORS). Correct CORS setup is mainly a server-side concern.

The GoodData platform provides APIs to configure CORS for your account. Configuring CORS on your domain is the only feasible
approach for production deployment. You must use it even during development if your application will be using Single Sign-On (SSO) authentication flows.

If you plan to use username and password authentication during development on your localhost, you avoid the server-side CORS
setup by using a development proxy.


## Step 5. Configure authentication

You may have noticed that the code snippet in [Step 3](#step-3.-set-up-analytical-backend-and-integrate-it-into-your-application) set up authentication to use `ContextDeferredAuthProvider`. This effectively tells the Analytical Backend that your application takes care of handling setup of the authenticated session to the GoodData platform.

The implementation of the backend assumes that someone else does the authentication and as part of that sets the GoodData cookies with the essential tokens. If the session is not set up, the Analytical Backend raises the `NotAuthenticated` errors.

Your application can use the functions in `@gooddata/api-client-bear` to trigger the APIs to achieve either username and password
authentication or start an SSO authentication flow when needed.

This is how you can trigger the username and password login process using `@gooddata/api-client-bear`:

```javascript
import { factory } from "@gooddata/api-client-bear";

const bearClient = factory();
// or if your application will be hosted on a different host than the GoodData platform backend
const bearClient = factory({ domain: "https://example.com" }); // this should be the domain where the GoodData platform is hosted

await bearClient.user.login(this.username, this.password)
```

For SSO setup, see [Set Up Authentication and Single Sign-On](../platform_authentication_and_sso/).

**NOTE**: `ContextDeferredAuthProvider` allows you to provide a callback function in the constructor. This function will
be called every time when the Analytical Backend throws a `NotAuthenticated` error. This callback function is useful to
implement a mechanism for handling a "single point of failure" of the `NotAuthenticated` error and triggering the authentication flow in your application.

## Step 6. Update package.json
This step is currently optional and you need it only in case that you are going to use GoodData.UI geo charts.

Update browserslist property in `package.json` with the following configuration:
```
"browserslist": {
    "production": [
        ">0.2%",
        "not dead",
        "not ie 11",
        "not chrome < 51",
        "not safari < 10",
        "not android < 51"
    ],
    "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
    ]
},
```


## Next steps

At this point, your application should be set to use GoodData.UI and render visualizations from the GoodData platform. If you
also configured and run the [catalog-export](../../visualize_data/export_catalog/) tool, you can now start embedding visualizations
into your application:

```jsx
import { LineChart } from "@gooddata/sdk-ui-charts";
import { YourFact, YourMeasure, YourAttribute} from "./generatedMd";

function MyVisualization() {
    const measures = [YourFact.Sum, YourMeasure];
    const attributes = [ YourAttribute.DisplayFormName ];

    return (
      <LineChart
          measures={measures}
          trendBy={attribute}
      />
    );
}
```

**NOTE:** The imports from `generatedMd` are for illustration purposes. You can name the file with the generated
LDM as you see fit and store it in any location. The names of constants in the generated file will reflect the facts, measures, and attributes in your workspace.

Here are some suggestions about what you can do after you created your first visualization:

* Add more elements: tables, charts, custom visualizations. For more information, see [Visual Components](../../../references/visual_components/).
* [Enable drilling](../../add_interactivity/drillable_items/).
* Add a [customizable theme](../../apply_theming/) to your application.
* Authenticate your users using [SSO](../platform_authentication_and_sso/) rather than sending them to a proxied GoodData login page.