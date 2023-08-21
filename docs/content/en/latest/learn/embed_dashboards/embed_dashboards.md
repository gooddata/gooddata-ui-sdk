---
title: Embed a Dashboard Created in KPI Dashboards
linkTitle: Embed a Dashboard
copyright: (C) 2007-2018 GoodData Corporation
weight: 11
---

To embed an existing dashboard created in KPI Dashboards, use the [Dashboard component](../../../references/dashboard_component/).

**Steps:**

1. Obtain the identifier of the dashboard via [catalog-export](../../visualize_data/export_catalog/).

2. Import the Dashboard component from the `@gooddata/sdk-ui-dashboard` package into your app:

    ```javascript
    import { Dashboard } from "@gooddata/sdk-ui-dashboard";
    ```

3. Create a `Dashboard` component in your app, and provide it with the workspace ID and the visualization identifier that you obtained at Step 1:

    ```jsx
    import { idRef } from "@gooddata/sdk-model";
    import { Dashboard } from "@gooddata/sdk-ui-dashboard";
    import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

    <Dashboard dashboard={idRef("aby3polcaFxy")} />;
    ```