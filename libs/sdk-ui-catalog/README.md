# GoodData.UI SDK - Analytics Catalog

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-catalog)](https://www.npmjs.com/@gooddata/sdk-ui-catalog)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-catalog)](https://npmcharts.com/compare/@gooddata/sdk-ui-catalog?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides React-based UI components to browse and manage analytics catalog items (dashboards, insights, measures, attributes, and facts).

## Components

### AnalyticsCatalog

An interactive explorer of your workspace catalog. It lists dashboards, insights, measures, attributes,
and facts with built‑in search, filtering, and a detail view. The component uses backend and workspace from context (or props).

Example usage:

```tsx
import { AnalyticsCatalog } from "@gooddata/sdk-ui-catalog";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

// Import styles (once in your app)
import "@gooddata/sdk-ui-catalog/styles/css/main.css";

export function App() {
    return (
        <BackendProvider backend={tigerBackend}>
            <WorkspaceProvider workspace="your-workspace-id">
                <AnalyticsCatalog />
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

You can also pass the backend and workspace directly via props:

```tsx
<AnalyticsCatalog backend={tigerBackend} workspace="your-workspace-id" />
```

### AnalyticsCatalogDetailContent

Detail content component that you can embed in your own layout.

Example usage:

```tsx
import { AnalyticsCatalogDetailContent } from "@gooddata/sdk-ui-catalog";

// Import styles (once in your app)
import "@gooddata/sdk-ui-catalog/styles/css/detail.css";

export function App() {
    return <AnalyticsCatalogDetailContent objectId="obj_123" objectType="insight" />;
}
```

### AnalyticsCatalogDetail

A ready-to-use overlay with catalog item details and actions.

Example usage:

```tsx
import { useState } from "react";
import { AnalyticsCatalogDetail } from "@gooddata/sdk-ui-catalog";

// Import styles (once in your app)
import "@gooddata/sdk-ui-catalog/styles/css/detail.css";

export function App() {
    const [open, setOpen] = useState(true);

    return (
        <AnalyticsCatalogDetail
            open={open}
            onClose={() => setOpen(false)}
            objectId="obj_123"
            objectType="insight"
        />
    );
}
```

## License

(C) 2025 GoodData Corporation

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
