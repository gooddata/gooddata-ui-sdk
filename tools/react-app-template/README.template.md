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

1. In [`webpack.config.js`](./webpack.config.js) replace the hostname of the server we are loading data from:
    ```diff
    -   const BACKEND_URL = "https://public-examples.gooddata.com";
    +   const BACKEND_URL = "https://<your-gooddata-instance-host>";
    ```
    If you're running dev server, you'll need to restart it for the change to take effect. If you have a demo data
    connected to your trial account [as per our docs](https://www.gooddata.com/developers/cloud-native/doc/cloud/getting-started/connect-data/#example-database),
    you should have a working project at this point.
2. Update your workspace ID to point to the workspace where your own data is connected to. In `App.{{language}}x`
    ```diff
    -   <WorkspaceProvider workspace="demo">
    +   <WorkspaceProvider workspace="<your-workspace-id>">
    ```
    TODO - where do I get workspaceID???
3. Fetch the new metadata.

### Connect your own data from _GoodData Platform_
