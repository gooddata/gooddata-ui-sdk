---
title: Header Predicates
linkTitle: Header Predicates
copyright: (C) 2007-2020 GoodData Corporation
id: ht_create_predicates
---

Predicates allow you to create a match between elements (for example, a measure header item or an attribute header item) with an arbitrary level of complexity.
The predicates are used in [drilling](../drillable_items/) so that you can decide which parts of your visualization can be drilled into.

A header predicate is a function returning a boolean value that takes two arguments:

* **Mapping Header** is an object that describes the item whose match is being tested (for more details, see the [definition](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/headerMatching/MappingHeader.ts#L16)).

* **Header Predicate Context** is additional data that describes the context in which the match is being tested: the data view that resulted in the values passed as the first argument (for more details, see the [definition](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/headerMatching/HeaderPredicate.ts#L8)).

If the predicate returns `true` for an item, the item is matched.

The most common predicates are predefined in [HeaderPredicateFactory](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/headerMatching/HeaderPredicateFactory.ts#L167-L309). You can also write your own predicates.

## Examples of custom header predicates

**Example:** A predicate that matches all items with the names starting with a capital `A`

```js
import { isResultAttributeHeader } from "@gooddata/sdk-model";

const startsWithA = (header) => {
    return isResultAttributeHeader(header) && header.attributeHeaderItem.name.startsWith("A");
};
```

**Example:** A predicate that matches only attribute headers and only if the visualization has up to three attributes

```js
import { isAttributeDescriptor } from "@gooddata/sdk-model";

const attributesIfNoMoreThanThree = (header, context) => {
    if (context.dv.def().attributes().length > 3) {
        return false;
    }

    return isAttributeDescriptor(header);
};
```