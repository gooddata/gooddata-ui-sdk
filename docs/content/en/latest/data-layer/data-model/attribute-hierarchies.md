---
title: Read attribute hierarchies
category: Data layer / Data model
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-model:ICatalogAttributeHierarchy"
  - "@gooddata/sdk-model:IAttributeHierarchyMetadataObject"
source_files:
  - src/workspace/ldm/catalog.ts
related_pages:
  - /docs/data-layer/data-model/workspace-catalog
  - /docs/data-layer/data-model/attributes
  - /docs/dashboard-plugins/use-dashboard-selector
  - /docs/dashboard-plugins/dashboard
  - /docs/integrations/interactivity/drillable-items
description: Read attribute hierarchies from the workspace catalog, and list them from a dashboard plugin.
type: docs
weight: 74
section: Data layer
subsection: Data model
---

An attribute hierarchy is a named, ordered list of attributes that describes a drill path — for example Country, then State, then City. Dashboards use a saved hierarchy to let viewers drill from one level to the next on a widget.

## Read hierarchies from the catalog

Saved hierarchies are catalog items. Load them the same way as measures and attributes — see [Load the workspace catalog at runtime](../workspace-catalog/) — by including `"attributeHierarchy"` in `forTypes`, then read them off the loaded `IWorkspaceCatalog`:

```ts
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export async function loadHierarchies(backend: IAnalyticalBackend, workspace: string) {
    const catalog = await backend.workspace(workspace).catalog().forTypes(["attributeHierarchy"]).load();

    return catalog.attributeHierarchies();
}
```

`catalog.attributeHierarchies()` returns every `ICatalogAttributeHierarchy` in the workspace. Use `catalog.availableAttributeHierarchies()` instead when you have already narrowed the catalog to items compatible with a specific measure or visualization (see [Offer only compatible items](../workspace-catalog/#offer-only-compatible-items)).

Each `ICatalogAttributeHierarchy` wraps an `IAttributeHierarchyMetadataObject`, which carries the ordered `attributes: ObjRef[]` — the drill path, from top level to bottom.

## List hierarchies from a dashboard plugin

To list the hierarchies available in the workspace from inside a plugin, use the `@beta` selector `selectCatalogAttributeHierarchies` with [useDashboardSelector](../../../dashboard-plugins/use-dashboard-selector/):

```ts
import { selectCatalogAttributeHierarchies, useDashboardSelector } from "@gooddata/sdk-ui-dashboard";

const hierarchies = useDashboardSelector(selectCatalogAttributeHierarchies);
```

See [Dashboard component](../../../dashboard-plugins/dashboard/) for the rest of the dashboard selector surface.

## Notes

- `attributes` on a hierarchy is ordered top to bottom. Reordering it changes the drill path, not just its membership.
