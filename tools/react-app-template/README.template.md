# GoodData React SDK App Template

This project contains a sample setup for a React app using [GoodData React SDK](https://github.com/gooddata/gooddata-ui-sdk).
It was bootstrapped with [@gooddata/app-toolkit](https://sdk.gooddata.com/gooddata-ui/docs/create_new_application.html).

See it action by running `{{packageManager}} start` command.

## Quick Introduction

> TODO - describe the data that is used in the project, with link to CN docs

The project includes:

-   All necessary NPM dependencies in [`package.json`](./package.json).
-   A set of useful scripts:
    -   `{{packageManager}} start` - to start the dev server.
    -   `{{packageManager}} run build` - to bundle production version of the app.
    -   `{{packageManager}} run clean` - to clear the results of the previous build.
    -   `{{packageManager}} run refresh-md` - to update the [metadata catalogue](https://sdk.gooddata.com/gooddata-ui/docs/export_catalog.html).
-   A sample [Webpack configuration](./webpack.config.js).
-   A development proxy to easily connect to the public demo data for visualizations without the need to work around CORS.
-   An example code for GoodData Rect SDK in the [`App.{{language}}x`](./src/App.{{language}}x) file.

## What's next?

Here are a few useful links:

-   [Learn what GoodData React SDK is all about](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
-   [Learn the core concepts](https://sdk.gooddata.com/gooddata-ui/docs/understand_execution_model.html).
-   Learn from [interactive code samples](https://sdk.gooddata.com/gooddata-ui/docs/interactive_examples.html) and [examples gallery](https://gdui-examples.herokuapp.com/).

What can you do with this project next? Here are a few ideas:

-   [Try a different visualization](#try-a-different-visualization)
-   [Build a visualization programmatically](#build-a-visualization-programmatically)
-   [Consume the raw data](#consume-the-raw-data)
-   [Apply theming](#apply-theming)
-   [Connect your own data from _GoodData Cloud_ or _GoodData.CN_ servers](#connect-your-own-data-from-gooddata-cloud-or-gooddatacn-servers)
-   [Connect your own data from _GoodData Platform_](#connect-your-own-data-from-gooddata-platform)

### Try a different visualization

By default, the project is configured to render a simple insight from the demo workspace. Let's render
a Dashboard instead from the same demo project.

In [`App.{{language}}x`](./src/App.{{language}}x) file, we need to:

1. Import the `Dashboard` component instead of the `InsightView` component.
    ```diff
    -   import { InsightView } from "@gooddata/sdk-ui-ext";
    +   import { Dashboard } from "@gooddata/sdk-ui-dashboard";
    ```
2. Replace the component used in JSX and provide the correct dashboard reference from the metadata catalog.
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} />
    +   <Dashboard dashboard={Md.Dashboards._1Overview} />
    ```

Read more about [Dashboard component](https://sdk.gooddata.com/gooddata-ui/docs/dashboard_component.html).

### Build a visualization programmatically

You can define your insight programmatically instead of referencing a pre-built visualization from the workspace.
Let's build a simple pie chart.

In [`App.{{language}}x`](./src/App.{{language}}x) file, we need to:

1. Import the `PieChart` component instead of the `InsightView` component.
    ```diff
    -   import { InsightView } from "@gooddata/sdk-ui-ext";
    +   import { PieChart } from "@gooddata/sdk-ui-charts";
    ```
2. Replace the component used in JSX and provide metrics and an attribute to view the data by.
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} />
    +   <PieChart measures={[Md.PercentRevenue]} viewBy={Md.Category_1} />
    ```

Read more about [PieChart](https://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html).

### Consume the raw data

Sometimes it's useful to get the raw data and use it to build a custom visualization or just use it in your app's business logic.

1. Create a new component that renders the same pie chart as a table. Create a new file `./src/MyTable.{{language}}x`:

    ```javascript
    import React from "react";
    import { useInsightDataView } from "@gooddata/sdk-ui";
    import { idRef } from "@gooddata/sdk-model";
    import * as Md from "./catalog";

    export const MyTable = () => {
        const { result, error, status } = useInsightDataView({
            insight: idRef(Md.Insights.ProductCategoriesPieChart),
        });

        if (error) {
            console.error(error);
            return <div>Error...</div>;
        }

        if (status !== "success" || !result) return <div>Loading...</div>;

        const slices = result.data().slices().toArray();

        return (
            <table>
                <tbody>
                    {slices.map((slice) => {
                        const title = slice.sliceTitles().join(" - ");
                        const value = slice
                            .dataPoints()
                            .map((dp) => dp.rawValue)
                            .join(", ");

                        return (
                            <tr key={title}>
                                <td>{title}</td>
                                <td>{value}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };
    ```

2. Import the newly created component in the [App.{{language}}x](./src/App.{{language}}x):
    ```diff
    -   import { InsightView } from "@gooddata/sdk-ui-ext";
    +   import { MyTable } from "./MyTable";
    ```
3. Import the newly created component in the [App.{{language}}x](./src/App.{{language}}x):
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} />
    +   <MyTable />
    ```

Read more about [custom executions](https://sdk.gooddata.com/gooddata-ui/docs/create_new_visualization.html).

### Apply theming

Theming is important for making embedded analytics look like it truly is a part of your app. Let's apply a custom
theme to our visualization by editing [`App.{{language}}x`](./src/App.{{language}}x):

1. Import a `ThemeProvider` component:
    ```diff
    +   import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
    ```
2. Add `ThemeProvider` right next to the `BackendProvider` and `WorkspaceProvider`:
    ```diff
        <WorkspaceProvider workspace="demo">
    +       <ThemeProvider>
                <div className="container">
    ...
                </div>
    +       </ThemeProvider>
        </WorkspaceProvider>
    ```
    Now `ThemeProvider` will load a theme from GoodData server, so if you have a custom one defined there - it should be applied.
3. Let's override the way tooltips look like:
    ```diff
    -   <ThemeProvider>
    +   <ThemeProvider theme={{
    +       chart: {
    +           tooltipBackgroundColor: "#333",
    +           tooltipBorderColor: "#555",
    +           tooltipLabelColor: "#eaeaea",
    +           tooltipValueColor: "#fff"
    +       }
    +   }}>
    ```

Read more about theming in [the docs](https://sdk.gooddata.com/gooddata-ui/docs/theme_provider.html) and check out [an example from the gallery](https://gdui-examples.herokuapp.com/theming).

### Connect your own data from _GoodData Cloud_ or _GoodData.CN_ servers

By default, GoodData React SDK is connecting to [the same demo data](https://www.gooddata.com/developers/cloud-native/doc/cloud/getting-started/connect-data/#example-database)
as you would get in your GoodData Cloud or GoodData.CN trial account. Here are a few steps on how to connect to
your own data instead.

1. In [`package.json`](./package.json) replace `hostname` and `workspaceId` to your own values:
    ```diff
    -    "hostname": "https://public-examples.gooddata.com",
    -    "workspaceId": "demo",
    +    "hostname": "https://<your-gooddata-instance-host>",
    +    "workspaceId": "<your-workspace-id>",
    ```
2. Generate an [API Token](https://www.gooddata.com/developers/cloud-native/doc/cloud/getting-started/create-api-token/) for development
   and put it to the [`.env` file](./.env):
    ```
    TIGER_API_TOKEN=<your_api_token>
    ```
   Make sure you do not commit the `.env` file to your VCS (e.g. Git)
3. Refresh [the metadata catalog](https://sdk.gooddata.com/gooddata-ui/docs/export_catalog.html) for the newly configured workspace: `npm run refresh-md`.
4. Update the `App.{{language}}x`. Since we've switched to your own data, the reference to the insight in `App.{{language}}x` is no longer valid.
   Select a new insight to render from the catalog and update `App.{{language}}x`:
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} showTitle />
    +   <InsightView insight={Md.Insights.<your-insight-id>} showTitle />
    ```

Read more about integration with GoodData Cloud or GoodData.CN in [our docs](https://sdk.gooddata.com/gooddata-ui/docs/cloudnative_getting_started.html).

### Connect your own data from _GoodData Platform_

By default, GoodData React SDK is configured to connect to GoodData Cloud or GoodData.CN server. Here is how you can switch to GoodData Platform instead.

1. Edit `./src/backend.{{language}}` file to use "bear" backend instead of "tiger" one:
    ```diff
    -    import backendFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-tiger";
    +    import backendFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-bear";
    ```
   You'll also need to define a logic on what to do if user is not logged in. The simplest case could look something like this:
    ```diff
    -     backendFactory().withAuthentication(new ContextDeferredAuthProvider()),
    +     backendFactory().withAuthentication(new ContextDeferredAuthProvider(() => {
    +         window.location.replace(`${window.location.origin}/account.html?lastUrl=${encodeURIComponent(window.location.href)}`);
    +     })),
    ```
   Your setup may vary, see our [documentation on different authentication options GoodData Platform provides](https://sdk.gooddata.com/gooddata-ui/docs/platform_sso.html).
2. Update `./package.json` to specify you're using "bear" backend. Update the hostname and workspaceId to the ones you'd like to connect to:
    ```diff
    -    "hostname": "https://public-examples.gooddata.com",
    -    "workspaceId": "demo",
    -    "backend": "tiger",
    +    "hostname": "https://<your-gooddata-instance-host>",
    +    "workspaceId": "<your-workspace-id>",
    +    "backend": "bear",
    ```
3. Update `.env` file and put there your `USERNAME` and `PASSWORD`.
    ```diff
    -    USERNAME=
    -    PASSWORD=
    +    USERNAME=<your-username>
    +    PASSWORD=<your-password>
    ```
   Make sure you do not commit the `.env` file to your VCS (e.g. Git).
4. Refresh [the metadata catalog](https://sdk.gooddata.com/gooddata-ui/docs/export_catalog.html) for the newly configured workspace: `npm run refresh-md`.
5. Update the `App.{{language}}x`. Since we've switched to your own data, the reference to the insight in `App.{{language}}x` is no longer valid.
   Select a new insight to render from the catalog and update `App.{{language}}x`:
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} showTitle />
    +   <InsightView insight={Md.Insights.<your-insight-id>} showTitle />
    ```
