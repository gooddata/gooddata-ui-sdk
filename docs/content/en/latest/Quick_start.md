---
title: "React Quick Start"
linkTitle: "Quick Start"
weight: 12
---

{{% alert color="warning" title="Version 9 vs Versions 10+" %}}
GoodData Platform users must stay on GoodData.UI version 9, do not update to version 10 or higher!
From version 10 onwards, the GoodData.UI SDK only supports GoodData Cloud and GoodData.CN.
{{% /alert %}}

The easiest way to get hands-on experience with GoodData.UI is to use the `@gooddata/app-toolkit`, which contans a sample setup for a React app

To see it in action:

- Run `npx @gooddata/app-toolkit@latest init`
- Follow instructions on the screen

## Quick Introduction

The project includes:

- A set of useful scripts:
    - `npm start` - to start the dev server.
    - `npm run build` - to bundle production version of the app.
    - `npm run clean` - to clear the results of the previous build.
    - `npm run refresh-md` - to update the [metadata catalogue](../learn/visualize_data/export_catalog/#ExportCatalog-AcceleratorToolkitapplications).
- A development proxy to easily connect to the public demo data for visualizations without the need to work around CORS.
- An example code for GoodData Rect SDK in the `App.tsx` file.

## What's next?

What can you do with this project?

Here are a few ideas:

- [Try a different visualization](#try-a-different-visualization)
- [Build a visualization programmatically](#build-a-visualization-programmatically)
- [Consume the raw data](#consume-the-raw-data)
- [Apply theming](#apply-theming)
- [Connect your own data from _GoodData Cloud_ or _GoodData.CN_ servers](#connect-your-own-data-from-gooddata-cloud-or-gooddatacn-servers)

### Try a different visualization

By default, the project is configured to render a simple visualization from the demo workspace. So let's render
a Dashboard instead!

It's an easy 2 step solution. In `App.tsx` simply:

1.  Import the `Dashboard` component instead of the `InsightView` component.
    `diff
    - import { InsightView } from "@gooddata/sdk-ui-ext";
    * import { Dashboard } from "@gooddata/sdk-ui-dashboard";
      `

            {{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.

    {{% /alert %}}

2.  Replace the component used in JSX and provide the correct dashboard reference from the metadata catalog.
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} />
    +   <Dashboard dashboard={Md.Dashboards._1Overview} />
    ```

To learn more, see [Dashboard component](../references/dashboard_component/).

### Build a visualization programmatically

If you don't want to use the pre-built visualization, you can easily define your visualization programatically!

Let's build a simple pie chart in two steps!

In `App.tsx` file:

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

Read more about [PieChart](../references/visual_components/pie_chart/).

### Consume the raw data

Sometimes it's useful to get the raw data and use it to build a custom visualization or just use it in your app's business logic.

Get your data in three steps:

1. Create a new component that renders the same pie chart as a table. Create a new file `./src/MyTable.tsx`:

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

2. Import the newly created component in the `App.tsx`:
    ```diff
    -   import { InsightView } from "@gooddata/sdk-ui-ext";
    +   import { MyTable } from "./MyTable";
    ```
3. Import the newly created component in the `App.tsx`:
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} />
    +   <MyTable />
    ```

Read more about how to [get raw data](../learn/get_raw_data/).

### Apply theming

Theming is important for making embedded analytics look like it truly is a part of your app. Let's apply a custom theme to our visualization by editing `App.tsx`:

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

Read more about the [theming](../learn/apply_theming/) and check out [an example from the gallery](https://gdui-examples.herokuapp.com/theming).

### Connect your own data from _GoodData Cloud_ or _GoodData.CN_ servers

By default, GoodData React SDK is connecting to [the same demo data](https://www.gooddata.com/docs/cloud/getting-started/connect-data/#example-database)
as you would get in your GoodData Cloud or GoodData.CN trial account.

Here are a few steps on how to connect to
your own data:

1. In package.json replace `hostname` and `workspaceId`:
    ```diff
    -    "hostname": "https://public-examples.gooddata.com",
    -    "workspaceId": "demo",
    +    "hostname": "https://<your-gooddata-instance-host>",
    +    "workspaceId": "<your-workspace-id>",
    ```
2. Generate an [API Token](https://www.gooddata.com/docs/cloud/getting-started/create-api-token/)and add it to the `.env` file:
   `     TIGER_API_TOKEN=<your_api_token>
 `

    > Make sure you do not commit the `.env` file to your VCS (e.g. Git)

3. Refresh [the metadata catalog](../learn/visualize_data/export_catalog/#ExportCatalog-AcceleratorToolkitapplications) for the newly configured workspace: `npm run refresh-md`.
4. Update the `App.tsx`. Since we've switched to your own data, the reference to the insight in `App.tsx` is no longer valid.
   Select a new visualization to render from the catalog and update `App.tsx`:
    ```diff
    -   <InsightView insight={Md.Insights.ProductCategoriesPieChart} showTitle />
    +   <InsightView insight={Md.Insights.<your-insight-id>} showTitle />
    ```

Read more about [integration with GoodData Cloud or GoodData.CN](../learn/integrate_and_authenticate/cn_and_cloud_authentication/) .

### Update from v9 to v10

Upgrade all the `@gooddata` dependencies to the latest stable version in `package.json`.

> **Note:** Starting with version 10.0.0, the **gooddata-ui-sdk** no longer supports the GoodData Platform. It is necessary to remove `"@gooddata/sdk-backend-bear"` from the `package.json`.

### Update from v10 to v11

Make sure your application uses React version 18 or 19.
Upgrade all the `@gooddata` dependencies to the latest stable version in `package.json`.

Previously, you had to provide the createRoot method to support React 18. This is no longer needed and
the call to `provideCreateRoot` can be removed. We are keeping it as a no-op for backward compatibility.

```javascript
import { createRoot } from "react-dom/client";
import { provideCreateRoot } from "@gooddata/sdk-ui-ext";

// can be removed
provideCreateRoot(createRoot);
```

Also note that although SDK supports both React 18 and 19, dashboard plugins are still created with React 18.
Support for React 19 in dashboard plugins will be added in one of the upcoming updates.
