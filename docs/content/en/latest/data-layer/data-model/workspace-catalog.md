---
title: Load the workspace catalog at runtime
category: Data layer / Data model
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-backend-spi:IWorkspaceCatalogFactory"
  - "@gooddata/sdk-backend-spi:IWorkspaceCatalog"
  - "@gooddata/sdk-backend-spi:IWorkspaceCatalogWithAvailableItems"
  - "@gooddata/sdk-model:ICatalogMeasure"
  - "@gooddata/sdk-model:ICatalogAttribute"
source_files:
  - src/workspace/ldm/catalog.ts
related_pages:
  - /docs/data-layer/data-model/export-catalog
  - /docs/data-layer/data-model/measures
  - /docs/data-layer/data-model/attributes
  - /docs/data-layer/data-model/object-references
  - /docs/data-layer/data-model/attribute-hierarchies
description: Load measures, attributes, and date datasets while your application runs, and turn catalog items into IMeasure and IAttribute objects.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 77
section: Data layer
subsection: Data model
---

Load the logical data model (LDM) of a workspace at runtime when your users choose what to visualize, or when you don't know the model at build time. If the model is fixed, generate constants instead; see [Export catalog](../export-catalog/).

## Before you start

You need an `IAnalyticalBackend` and a workspace identifier. Inside a React tree wrapped in `BackendProvider` and `WorkspaceProvider`, get both from `useBackendStrict` and `useWorkspaceStrict`.

## Load the catalog

Ask the workspace for its catalog, restrict what to load, and call `load()`.

```ts
import { type IAnalyticalBackend, type IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";

export function loadCatalog(
    backend: IAnalyticalBackend,
    workspace: string,
    signal?: AbortSignal,
): Promise<IWorkspaceCatalog> {
    let factory = backend
        .workspace(workspace)
        .catalog()
        .forTypes(["measure", "attribute", "dateDataset"])
        .withGroups(false);

    if (signal) {
        factory = factory.withSignal(signal);
    }

    return factory.load();
}
```

| Option | Effect |
|--------|--------|
| [`forTypes(types)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.iworkspacecatalogfactorymethods.fortypes.md" >}}) | Load only these item types: `"measure"`, `"attribute"`, `"fact"`, `"dateDataset"`, `"attributeHierarchy"` (see [Attribute hierarchies](../attribute-hierarchies/)). Loading less is faster. |
| [`withGroups(false)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.iworkspacecatalogfactorymethods.withgroups.md" >}}) | Skip loading catalog groups when you do not show them. |
| [`includeTags(refs)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.iworkspacecatalogfactorymethods.includetags.md" >}}), [`excludeTags(refs)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.iworkspacecatalogfactorymethods.excludetags.md" >}}) | Keep or drop items by tag. |
| [`forDataset(ref)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.iworkspacecatalogfactorymethods.fordataset.md" >}}) | Limit items to one dataset. |
| [`withSignal(signal)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.iworkspacecatalogfactorymethods.withsignal.md" >}}) | Cancel the request through an `AbortSignal`. |

## Wrap it in a hook

`useCancelablePromise` handles loading, error, and cancellation when the backend or workspace changes. It calls
your factory with an `AbortSignal`. Pass it to `withSignal`, so that switching workspaces aborts the request still in
flight instead of letting it finish in the background.

```tsx
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

export function useWorkspaceCatalog() {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return useCancelablePromise(
        { promise: (signal) => loadCatalog(backend, workspace, signal) },
        [backend, workspace],
    );
}

export function CatalogSummary() {
    const { status, result: catalog } = useWorkspaceCatalog();

    if (status !== "success") {
        return <div>{status === "error" ? "Could not load the catalog" : "Loading catalog..."}</div>;
    }

    return <div>{catalog.measures().length} measures</div>;
}
```

Load the catalog once, high in the component tree, and pass it down through props or a context. A catalog can hold thousands of items, and each `load()` is a round trip to the analytics engine.

## Read the items

Each catalog item wraps a metadata object with `id`, `ref`, `title`, `description`, and optional `tags`.

| Item | Key fields |
|------|------------|
| [`ICatalogMeasure`]({{< relref "/latest/api-reference/sdk-model/sdk-model.icatalogmeasure.md" >}}) | `measure.ref`, `measure.id`, `measure.title`, `measure.tags` |
| [`ICatalogAttribute`]({{< relref "/latest/api-reference/sdk-model/sdk-model.icatalogattribute.md" >}}) | `attribute.ref`, `attribute.title`, `defaultDisplayForm.ref`, `displayForms[]` |
| [`ICatalogDateDataset`]({{< relref "/latest/api-reference/sdk-model/sdk-model.icatalogdatedataset.md" >}}) | `dataSet.ref`, `dateAttributes[].defaultDisplayForm.ref`, `dateAttributes[].granularity` |

An attribute has several display forms. Offer the default one and keep the others for a label switcher:

```ts
import { type IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";

export function attributeOptions(catalog: IWorkspaceCatalog) {
    return catalog.attributes().map((item) => ({
        id: item.attribute.id,
        title: item.attribute.title,
        displayForm: item.defaultDisplayForm.ref,
        otherDisplayForms: item.displayForms.map((displayForm) => displayForm.ref),
    }));
}
```

## Turn items into executable objects

Visual components take `IMeasure` and `IAttribute`, not catalog items. Build them from the references.

```tsx
import { newAttribute, newMeasure, type ICatalogAttribute, type ICatalogMeasure } from "@gooddata/sdk-model";
import { ColumnChart } from "@gooddata/sdk-ui-charts";

export function PickedChart({ measure, attribute }: { measure: ICatalogMeasure; attribute: ICatalogAttribute }) {
    return (
        <ColumnChart
            measures={[newMeasure(measure.measure.ref)]}
            viewBy={newAttribute(attribute.defaultDisplayForm.ref)}
        />
    );
}
```

## Offer only compatible items

After a user picks a measure, offer only the attributes that can slice it. The catalog computes that list for you.

```ts
import { type IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";
import { newMeasure, type ICatalogMeasure } from "@gooddata/sdk-model";

export async function attributesFor(catalog: IWorkspaceCatalog, measure: ICatalogMeasure) {
    const available = await catalog
        .availableItems()
        .forItems([newMeasure(measure.measure.ref)])
        .load();

    return available.availableAttributes();
}
```

`availableItems()` also accepts `forInsight(insight)` to check compatibility with a whole visualization.

## Notes

- Titles come back in the locale of the user making the request. Reload the catalog when the locale changes.
- `tags` is optional on every metadata object. Default it to an empty array before you filter on it.
- The catalog reflects the model at load time. Reload after your application changes the model.
- To index items by `ObjRef`, key with `serializeObjRef`; see [Working with object references](../object-references/).
