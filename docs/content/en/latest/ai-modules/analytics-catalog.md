---
legacy_path: references/embed_analytics_catalog
title: Analytics Catalog
description: Embed the AnalyticsCatalog explorer to let users browse and search the metrics, attributes, facts, datasets, visualizations, and dashboards of a workspace.
category: AI & Modules
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-catalog:AnalyticsCatalog"
source_files:
  - src/AnalyticsCatalog.tsx
related_pages:
  - /docs/data-layer/data-model/workspace-catalog
  - /docs/data-layer/data-model/export-catalog
  - /docs/ai-modules/semantic-search
  - /docs/ai-modules/ai-assistant
  - /docs/getting-started/installation
type: docs
weight: 56
section: AI & Modules
aliases:
  - "../references/embed_analytics_catalog/"
---

`AnalyticsCatalog` from `@gooddata/sdk-ui-catalog` renders an interactive explorer of the objects in a workspace, with search, filters, and a detail view of each object.

The explorer lists these object types:

| Object type | What it is |
| --- | --- |
| Metrics | Saved calculations defined in MAQL |
| Attributes | Descriptive dimensions for slicing data |
| Facts | Raw numeric columns available for aggregation |
| Datasets | Tables of the logical data model (LDM) that link facts and attributes |
| Visualizations | Saved visualizations |
| Dashboards | Saved dashboards |

## Basic usage

`AnalyticsCatalog` takes the backend and workspace from `BackendProvider` and `WorkspaceProvider`, or from the `backend` and `workspace` props.

```tsx
import { AnalyticsCatalog } from "@gooddata/sdk-ui-catalog";

import "@gooddata/sdk-ui-catalog/styles/css/main.css";

export const CatalogPage = () => <AnalyticsCatalog workspace="<workspace-id>" />;
```

To handle a click on an object, for example to route to your own page, use `onCatalogItemNavigation` or `onCatalogItemOpenClick`. To open the detail of an object on first render, pass its reference in `openCatalogItemRef`.

## Catalog objects in code

The explorer is a UI. To use catalog objects in your own code:

- For typed references at build time, generate a catalog file with `catalog-export`. See [Export catalog](../../data-layer/data-model/export-catalog/) and [typed references with the metadata catalog](../../getting-started/installation/#optional-typed-references-with-the-metadata-catalog).
- To load the catalog at runtime, use `backend.workspace(workspaceId).catalog().load()`. See [Load the workspace catalog at runtime](../../data-layer/data-model/workspace-catalog/).

## Props

{{% props %}}
