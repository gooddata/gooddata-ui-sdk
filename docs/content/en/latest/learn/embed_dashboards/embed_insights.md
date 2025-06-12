---
title: Embed a Visualizations Created in Analytical Designer
linkTitle: Embed a Visualization
copyright: (C) 2007-2021 GoodData Corporation
weight: 12
---

To embed an existing visualization created in Analytical Designer, use the [InsightView component](../../visualize_data/insightview/).

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

**Steps:**

1. Obtain the identifier of the visualization via [catalog-export](../../visualize_data/export_catalog/).

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
