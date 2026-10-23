---
title: Quick start
description: Scaffold a GoodData.UI React app with app-toolkit, render a
  dashboard and a chart you define in code, read raw data, apply a theme, and
  connect your own workspace.
category: Getting Started
diataxis_type: tutorial
legacy_path: quick_start
api_symbols:
  - "@gooddata/sdk-ui-dashboard:Dashboard"
  - "@gooddata/sdk-ui-ext:InsightView"
  - "@gooddata/sdk-ui-charts:PieChart"
  - "@gooddata/sdk-ui:useInsightDataView"
  - "@gooddata/sdk-ui-theme-provider:ThemeProvider"
related_pages:
  - /docs/getting-started/installation
  - /docs/dashboard-plugins/dashboard
  - /docs/visualisations/charts-and-plots
  - /docs/data-layer/use-execution-data-view
  - /docs/integrations/embedding/apply-theming
type: docs
weight: 2
section: Getting Started
aliases:
  - "../quick_start/"
---

The fastest way to see GoodData.UI working is `@gooddata/app-toolkit`. It scaffolds a small React app that is already connected to a public demo workspace, so the first chart renders before you configure anything. This tutorial takes you from that command to your own data.

You need Node.js `>=24.12.0` (an LTS release is recommended) and npm. You don't need a GoodData account yet.

## Create the project

Run the toolkit and answer its one prompt, the language (TypeScript or JavaScript):

```bash
npx @gooddata/app-toolkit@latest init my-analytics-app
```

The toolkit unpacks the `react-app` template into `my-analytics-app/` and installs its dependencies with npm. Prefer yarn, or want to skip the prompt? Pass `--package-manager yarn`, `--language ts`, or `--skip-install`; `npx @gooddata/app-toolkit@latest init --help` lists every option.

Start the dev server:

```bash
cd my-analytics-app
npm start
```

Your browser opens on `https://127.0.0.1:3000` with a page that says "Hello GoodWorld!" and renders a pie chart of product categories from the demo workspace. That chart is a saved visualization, rendered by the `InsightView` component. The dev server uses a self-signed certificate, so accept the browser's warning once. Set the `PORT` environment variable if 3000 is taken; the dev server fails rather than picking another port.

## Look around the project

There is no framework hiding anything. Every file is yours to edit:

```text
my-analytics-app/
├── package.json          # Dependencies, scripts, and the gooddata block
├── vite.config.ts        # Vite build and dev server, including the API proxy
├── index.html            # Page that Vite serves; loads src/index.tsx
├── tsconfig.json         # TypeScript configuration (TypeScript projects only)
├── .env                  # Holds TIGER_API_TOKEN, empty for now
├── .gitignore            # Already ignores .env
├── README.md
├── public/               # Static files served as-is, currently the favicon
└── src/
    ├── index.tsx         # React entry point; imports the SDK stylesheets
    ├── App.tsx           # The sample component. Start here
    ├── backend.ts        # Analytical backend instance and auth provider
    ├── catalog.ts        # Generated workspace metadata, don't edit by hand
    ├── index.css         # Styles for the sample page
    ├── typings.d.ts      # Ambient types for SVG and CSS imports and WORKSPACE_ID
    └── assets/           # Logo and background image used by the sample page
```

If you chose JavaScript at the prompt, the same files use `.jsx` and `.js` extensions, including `vite.config.js`, and there's no `tsconfig.json` or `typings.d.ts`.

Three files do most of the work:

`src/App.tsx` is where you'll spend your time. It wraps the app in `BackendProvider` and `WorkspaceProvider` and renders a single `InsightView`. Every step below edits this file, and each starts from the sample as the toolkit generated it, so take them in any order.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

That's why the catalog constant is `Insights` and the component is `InsightView`.

`src/catalog.ts` is generated. `@gooddata/catalog-export` reads your workspace and writes a typed constant for each visualization, dashboard, measure, and attribute. In TypeScript, a mistyped reference then fails at compile time rather than at runtime. Run `npm run refresh-md` to regenerate it.

`package.json` carries a `gooddata` block that the rest of the setup reads:

```json
"gooddata": {
    "hostname": "https://public-examples.gooddata.com",
    "workspaceId": "demo",
    "backend": "tiger",
    "catalogOutput": "src/catalog.ts"
}
```

The dev server [proxies API calls](../../integrations/cross-origin-issues/#proxy-the-api-in-development) to `hostname`, so the browser never makes a cross-origin request. Vite's `define` option injects `workspaceId` into the app as the `WORKSPACE_ID` global, and `refresh-md` writes to `catalogOutput`. You'll change the first two values when you [connect your own data](#connect-your-own-data).

The scripts you'll use:

- `npm start` starts the dev server.
- `npm run build` bundles the production version of the app into `dist/`.
- `npm run refresh-md` regenerates the [metadata catalog](../../data-layer/data-model/export-catalog/#applications-created-with-app-toolkit).

## Render a dashboard

The sample renders one saved visualization. Let's render a whole saved dashboard instead, with its filters, layout, and cross-filtering. Two edits in `App.tsx`:

1. Import the `Dashboard` component and the `Dashboards` catalog constants.

    ```diff
    - import { InsightView } from "@gooddata/sdk-ui-ext";
    + import { Dashboard } from "@gooddata/sdk-ui-dashboard";
    - import { Insights } from "./catalog.js";
    + import { Dashboards } from "./catalog.js";
    ```

2. Swap the component in JSX and point it at a dashboard from the catalog.

    ```diff
    -   <InsightView insight={Insights.ProductCategoriesPieChart} showTitle />
    +   <Dashboard dashboard={Dashboards._1Overview} />
    ```

The dev server reloads and the "1. Overview" dashboard from the demo workspace fills the page. Read more about the [Dashboard component](../../dashboard-plugins/dashboard/).

The catalog constant is handy here, but real apps usually don't hardcode a dashboard. They list the workspace's dashboards at runtime and render the one the user picks. [Add GoodData.UI to an existing React app](../installation/#render-a-dashboard-your-users-pick) shows that pattern.

## Build a chart in code

You don't have to save a visualization first. Any chart component accepts measures and attributes straight from the catalog. Let's build the same pie chart by hand:

1. Import `PieChart` and the measure and attribute it needs.

    ```diff
    - import { InsightView } from "@gooddata/sdk-ui-ext";
    + import { PieChart } from "@gooddata/sdk-ui-charts";
    - import { Insights } from "./catalog.js";
    + import { Category_1, PercentRevenue } from "./catalog.js";
    ```

2. Replace the component in JSX, passing a measure and an attribute to slice it by.

    ```diff
    -   <InsightView insight={Insights.ProductCategoriesPieChart} showTitle />
    +   <PieChart measures={[PercentRevenue]} viewBy={Category_1} />
    ```

Every chart component works this way. You pass `measures` plus one or more attribute props such as `viewBy` or `stackBy`. Read more about [PieChart](../../visualisations/pie-chart/) and the rest of the [visualizations](../../visualisations/).

## Read the raw data

Sometimes you want the numbers rather than a chart, maybe to feed your own visualization library or your app's business logic. The `useInsightDataView` hook runs the same execution a chart would and hands you the result.

1. Create `src/MyTable.tsx`, which renders the pie chart's data as a plain table:

    ```tsx
    import { useInsightDataView } from "@gooddata/sdk-ui";
    import { idRef } from "@gooddata/sdk-model";

    import { Insights } from "./catalog.js";

    export function MyTable() {
        const { result, error, status } = useInsightDataView({
            insight: idRef(Insights.ProductCategoriesPieChart),
        });

        if (error) {
            console.error(error);
            return <div>Error...</div>;
        }

        if (status !== "success" || !result) {
            return <div>Loading...</div>;
        }

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
    }
    ```

2. Render it from `App.tsx`:

    ```diff
    - import { InsightView } from "@gooddata/sdk-ui-ext";
    + import { MyTable } from "./MyTable.js";
    ```

    ```diff
    -   <InsightView insight={Insights.ProductCategoriesPieChart} showTitle />
    +   <MyTable />
    ```

Read more about [useInsightDataView](../../data-layer/use-insight-data-view/) and the rest of the [data layer](../../data-layer/).

## Apply a theme

Theming makes embedded analytics look like part of your app rather than a widget dropped in. `ThemeProvider` loads the theme configured on your GoodData server and lets you override any part of it in code. In `App.tsx`:

1. Import `ThemeProvider`.

    ```diff
    + import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
    ```

2. Wrap the content inside `WorkspaceProvider`.

    ```diff
        <WorkspaceProvider workspace={workspaceId}>
    +       <ThemeProvider>
                <div className="app">
    ...
                </div>
    +       </ThemeProvider>
        </WorkspaceProvider>
    ```

    If your workspace has a custom theme defined on the server, it is applied now.

3. Override how tooltips look:

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

Read more about [theming](../../integrations/embedding/apply-theming/) and try [the theming example in the gallery](https://gdui-examples.herokuapp.com/theming).

## Connect your own data

So far the app has been reading the [public demo workspace](https://www.gooddata.ai/docs/cloud/getting-started/connect-data/#example-database), the same data a GoodData Cloud or GoodData.CN trial starts with. Point it at your workspace in four steps:

1. In `package.json`, replace `hostname` and `workspaceId`:

    ```diff
    -    "hostname": "https://public-examples.gooddata.com",
    -    "workspaceId": "demo",
    +    "hostname": "https://<your-gooddata-instance-host>",
    +    "workspaceId": "<your-workspace-id>",
    ```

2. Create an [API token](https://www.gooddata.ai/docs/cloud/manage-organization/user-token/) and paste it into the `.env` file in the project root. The dev-server proxy attaches it to every API call, and `refresh-md` uses it too:

    ```bash
    TIGER_API_TOKEN=<your_api_token>
    ```

    The file is already listed in `.gitignore`. Never commit it.

3. Regenerate the catalog for the new workspace:

    ```bash
    npm run refresh-md
    ```

4. Update `App.tsx`. The demo visualization no longer exists in your workspace, so pick one of yours from the regenerated `Insights` constants:

    ```diff
    -   <InsightView insight={Insights.ProductCategoriesPieChart} showTitle />
    +   <InsightView insight={Insights.<YourVisualization>} showTitle />
    ```

Restart `npm start` and your own data renders. Putting the token in the dev proxy is fine for development only. Before you ship, switch to the sign-in flow described in [Authenticate to the backend](../../integrations/authentication/) and allow your app's origin in [CORS settings](../../integrations/cross-origin-issues/#allow-your-origin-in-production).

## Next steps

Your app renders your data. From here, pick the guide that matches what you're building:

- [Add GoodData.UI to an existing React app](../installation/) applies the same setup to a React app you already have.
- [Embed dashboards](../../integrations/embedding/embed-dashboards/) drops a full dashboard into your app and configures it.
- [Apply theming](../../integrations/embedding/apply-theming/) matches embedded analytics to your brand.
- [Filters](../../filters/) let users narrow down what a chart or dashboard shows.
- The [Angular](../../integrations/framework-integrations/angular-integration/), [Vue](../../integrations/framework-integrations/vue-integration/), and [Next.js](../../integrations/framework-integrations/nextjs-integration/) guides take GoodData.UI outside a plain React app.
