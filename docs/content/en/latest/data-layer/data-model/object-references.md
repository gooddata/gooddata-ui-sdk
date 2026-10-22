---
title: Working with object references
category: Data layer / Data model
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-model:ObjRef"
  - "@gooddata/sdk-model:idRef"
  - "@gooddata/sdk-model:areObjRefsEqual"
  - "@gooddata/sdk-model:serializeObjRef"
  - "@gooddata/sdk-model:objRefToString"
source_files:
  - src/objRef/index.ts
  - src/objRef/factory.ts
related_pages:
  - /docs/data-layer/data-model/attributes
  - /docs/data-layer/data-model/measures
  - /docs/filters/inspecting-filters
  - /docs/data-layer/data-model/workspace-catalog
description: Compare, key, narrow, and print ObjRef values with areObjRefsEqual, serializeObjRef, and the type guards instead of reading identifier fields by hand.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 71
section: Data layer
subsection: Data model
---

An `ObjRef` points to one object in a workspace: a display form, a measure, a dataset, a dashboard. Every filter, attribute, measure, and widget the SDK hands you carries one. This page lists the helpers for comparing, keying, narrowing, and printing references.

## Reference kinds

| Kind | Factory | Shape | Where you see it |
|------|---------|-------|-------------------|
| [`IdentifierRef`]({{< relref "/latest/api-reference/sdk-model/sdk-model.identifierref.md" >}}) | [`idRef(identifier, type?)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.idref.md" >}}) | `{ identifier, type? }` | Generated catalog constants, objects in GoodData Cloud and GoodData.CN |
| [`UriRef`]({{< relref "/latest/api-reference/sdk-model/sdk-model.uriref.md" >}}) | [`uriRef(uri)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.uriref.md" >}}) | `{ uri }` | Objects addressed by URI |
| [`LocalIdRef`]({{< relref "/latest/api-reference/sdk-model/sdk-model.localidref.md" >}}) | [`localIdRef(localIdentifier)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.localidref.md" >}}) | `{ localIdentifier }` | References between items inside one execution definition |

`ObjRef` is `IdentifierRef | UriRef`. `ObjRefInScope` adds `LocalIdRef`.

## Compare two references

Use `areObjRefsEqual`. Do not compare `identifier` fields yourself.

```ts
import { areObjRefsEqual, attributeDisplayFormRef, filterObjRef, type IFilter } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const regionDisplayForm = attributeDisplayFormRef(Md.Region.Default);

function findRegionFilter(filters: IFilter[]): IFilter | undefined {
    return filters.find((filter) => areObjRefsEqual(filterObjRef(filter), regionDisplayForm));
}
```

Equality rules:

- Two identifier references are equal when their identifiers match. `type` is compared only when both carry one.
- An identifier reference never equals a URI reference, even when both point to the same object.
- Two `null` or `undefined` values are equal. One `null` and one reference are not.

## Use a reference as a key

`serializeObjRef` returns a stable string that keeps the kind and the `type`. `deserializeObjRef` turns it back into a reference.

```ts
import { deserializeObjRef, idRef, measureItem, serializeObjRef, type IMeasure, type ObjRef } from "@gooddata/sdk-model";

const titles = new Map<string, string>();

function rememberTitle(ref: ObjRef, title: string): void {
    titles.set(serializeObjRef(ref), title);
}

function titleOf(measure: IMeasure): string | undefined {
    const ref = measureItem(measure);
    return ref ? titles.get(serializeObjRef(ref)) : undefined;
}

// Round trip
const restored = deserializeObjRef(serializeObjRef(idRef("f_owner.region_id", "displayForm")));
```

Keys are strict: `idRef("x")` and `idRef("x", "displayForm")` produce different keys. When you build references to key by, pass the same `type` argument every time, or key by the reference the SDK gave you.

## Narrow before reading a field

Use the type guards. A cast such as `ref as IdentifierRef` compiles, but when a URI reference reaches it, `ref.identifier` is `undefined`, and the bug shows up later as a missing key.

```ts
import { isIdentifierRef, type ObjRef } from "@gooddata/sdk-model";

function identifierOf(ref: ObjRef): string | undefined {
    return isIdentifierRef(ref) ? ref.identifier : undefined;
}
```

`isUriRef` and `isLocalIdRef` work the same way.

## Print a reference

`objRefToString` returns the bare identifier, URI, or local identifier. Use it for logs, debugging, and test output.

{{% alert color="warning" title="Not a key" %}}
`objRefToString` drops the kind and the `type`. `idRef("x", "displayForm")`, `idRef("x", "dataSet")`, and `uriRef("x")` all print `"x"`, so a `Map` or `Set` keyed by it merges different objects.
{{% /alert %}}

## Helper summary

| Task | Helper |
|------|--------|
| Create a reference | `idRef`, `uriRef`, `localIdRef` |
| Compare | `areObjRefsEqual(a, b)` |
| Key a `Map`, `Set`, or `Record` | `serializeObjRef(ref)`, `deserializeObjRef(value)` |
| Narrow | `isIdentifierRef`, `isUriRef`, `isLocalIdRef`, `isObjRef` |
| Print | `objRefToString(ref)` |
| Get the reference out of an SDK object | `attributeDisplayFormRef(attribute)`, `measureItem(measure)`, `filterObjRef(filter)` |
