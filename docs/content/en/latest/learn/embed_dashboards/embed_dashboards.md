---
title: Embed a Dashboard Created in KPI Dashboards
linkTitle: Embed a Dashboard
copyright: (C) 2007-2018 GoodData Corporation
weight: 11
---

To embed an existing insight created in Analytical Designer, use the [InsightView component](../../visualize_data/insightview/).

**Steps:**

1. Obtain the identifier of the insight via [catalog-export](../../visualize_data/export_catalog/).

2. Import the InsightView component from the `@gooddata/sdk-ui-ext` package into your app:
    ```javascript
    import { InsightView } from "@gooddata/sdk-ui-ext";
    ```

3. Create an `InsightView` component in your app, and provide it with the workspace ID and the visualization identifier that you obtained at Step 1:
    ```jsx
    import { InsightView } from "@gooddata/sdk-ui-ext";
    import "@gooddata/sdk-ui-ext/styles/css/main.css";

    <InsightView
        insight="aby3polcaFxy"
        config={{
            colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"],
            legend: {
                enabled: true,
                position: "bottom"
            }
        }}
    />
    ```
