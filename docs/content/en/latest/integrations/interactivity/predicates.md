---
legacy_path: learn/add_interactivity/predicates
title: Header predicates
category: Integrations / Interactivity
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:HeaderPredicates"
  - "@gooddata/sdk-ui:IHeaderPredicate"
source_files:
  - src/base/headerMatching/HeaderPredicateFactory.ts
  - src/base/headerMatching/MappingHeader.ts
related_pages:
  - /docs/integrations/interactivity/drillable-items
  - /docs/integrations/interactivity/on-drill
  - /docs/data-layer/data-model/export-catalog
description: Match visualization headers for drilling with custom predicate functions or the HeaderPredicates helpers.
ai_generated_description: true
type: docs
weight: 90
section: Integrations
subsection: Interactivity
aliases:
  - "../../learn/add_interactivity/predicates/"
---

A header predicate matches elements of a visualization, such as a measure header item or an attribute header item, with logic as simple or complex as you need. [Drilling](../drillable-items/) uses predicates to decide which parts of a visualization the user can drill into.

## Structure

A header predicate (`IHeaderPredicate`) is a function that takes two arguments and returns a boolean:

```ts
type IHeaderPredicate = (header: IMappingHeader, context: IHeaderPredicateContext) => boolean;
```

- `header` (`IMappingHeader`) is an object that describes the item whose match is being tested: an attribute descriptor, an attribute result header, a measure descriptor, a total descriptor, or a color descriptor.

- `context` (`IHeaderPredicateContext`) is additional data that describes the context in which the match is being tested. Its `dv` property holds the `DataViewFacade` of the data view that produced the header passed as the first argument.

If the predicate returns `true` for an item, the item is matched.

The most common predicates are predefined in `HeaderPredicates`, exported from `@gooddata/sdk-ui`:

- `identifierMatch(identifier, type?)` matches an attribute or measure header by identifier, including measures derived from a master measure with that identifier. `uriMatch(uri)` does the same by URI, which only GoodData Legacy uses.
- `localIdentifierMatch(localIdOrMeasure)` matches a header by the local identifier of its attribute or measure.
- `objRefMatch(objRef)` and `objMatch(obj)` match a header by an `ObjRef`, or by an attribute or simple measure object from the generated catalog.
- `attributeItemNameMatch(name)` matches an attribute result header by its displayed value.
- `composedFromIdentifier(identifier, type?)` matches arithmetic measures that use a measure with that identifier as an operand. `composedFromUri(uri)` does the same by URI.

## Example

You can also write your own predicates. This one matches all attribute values that start with a capital `A`:

```ts
import { type IHeaderPredicate } from "@gooddata/sdk-ui";
import { isResultAttributeHeader } from "@gooddata/sdk-model";

const startsWithA: IHeaderPredicate = (header) => {
    return isResultAttributeHeader(header) && !!header.attributeHeaderItem.name?.startsWith("A");
};
```

This one matches only attribute headers, and only when the visualization has at most three attributes:

```ts
import { type IHeaderPredicate } from "@gooddata/sdk-ui";
import { isAttributeDescriptor } from "@gooddata/sdk-model";

const attributesIfNoMoreThanThree: IHeaderPredicate = (header, context) => {
    if (context.dv.def().attributes().length > 3) {
        return false;
    }

    return isAttributeDescriptor(header);
};
```
