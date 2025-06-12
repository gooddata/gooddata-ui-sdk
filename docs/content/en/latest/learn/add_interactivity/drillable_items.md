---
title: DrillableItems
sidebar_label: DrillableItems
copyright: (C) 2007-2018 GoodData Corporation
id: drillable_item
---

You can enable eventing and drilling in a visualization. Drilling is the process of "zooming in" on a single measure value by filtering out all other data and breaking that value across a new attribute of interest.

To add drilling, use function predicates.

> Before Version 6.2, you could implement drilling using a list of `drillableItems` that contained the URI or identifier of a measure or attribute (for example, `{ identifier: "label.owner.department" }`  or `{ uri: "/gdc/md/workspaceHash/obj/1027" }`). While we do not recommend that you use this method anymore, it is still supported. For more information, see [DrillableItems](https://sdk.gooddata.com/gooddata-ui/docs/6.1.0/drillable_item.html) in the Version 6.1 documentation.

To turn on eventing and drilling, specify at least one `drillableItem`.

Drillable items can consist of the following entities:
* Measures
* Attribute `displayForm`s that are defined by their identifier or URI

    A `displayForm`, or attribute label, is a different means of representing an attribute. For example, the `Name` attribute might have labels for `Firstname` and `Lastname`. For more information, see [Attributes in Logical Data Models](https://help.gooddata.com/pages/viewpage.action?pageId=86795696).
* Attribute values defined by their URI

Visualization points that intersect any defined measures, attributes, or attribute values become drillable and will emit events when interacted with.

**NOTE:** Ad-hoc measures (measures created from attributes or other measures using the
[`computeRatio` option](https://sdk.gooddata.com/gooddata-ui/docs/afm.html#show-a-measure-as-a-percentage) are defined
using their URI or identifier in the execution. If you want to set up drilling for such ad-hoc measures, use the same parameter (URI or identifier) as you used in the execution.
Keep in mind that Analytical Designer creates such measures using only the URI. If you want to activate drilling on ad-hoc measures created in Analytical Designer, you can use only their URIs.

## Structure

```javascript
drillableItems: [
    (header: IMappingHeader, context: IMappingHeaderContext) => boolean, // Type: IHeaderPredicate
    ...
]
```

`IHeaderPredicate` defines the function that accepts `IMappingHeader` and `context` as its parameters and returns
a boolean value. This function is executed against every measure and attribute in a visualization. If the function
returns `true`, the measure or attribute is drillable. If the function returns `false`, the measure or attribute is
not drillable.

You can program any logic to determine whether a particular measure or attribute should be drillable. However, this is not required often. For more information, see [Create Header Predicates](../predicates/).

### Predicate factory helpers

GoodData.UI contains `HeaderPredicates` that helps you easily build predicate functions that cover most of the
common drill eventing use cases. You can import this factory directly from the `@gooddata/sdk-ui` package.

`HeaderPredicates` provides the following predicate factory functions:

* `uriMatch("<measure-or-attribute-uri>")`

    The helper builds a predicate function that matches any measure or attribute in a visualization to the provided URI.
* `identifierMatch("<measure-or-attribute-identifier>")`

    The helper builds a predicate function that matches any measure or attribute in a visualization to the provided identifier.
* `composedFromUri("<measure-or-attribute-uri>")`

    The helper builds a predicate function that matches any [arithmetic measure](../../get_raw_data/arithmetic_measure/) in a visualization containing measures to the provided URI in its tree of measures that the arithmetic measure is built from.
* `composedFromIdentifier("<measure-or-attribute-identifier>")`

    The helper builds a predicate function that matches any [arithmetic measure](../../get_raw_data/arithmetic_measure/) in a visualization containing measures to the provided identifier in its tree of measures that the arithmetic measure is built from.

## Set up drilling

To enable event drilling, specify a value for the `drillableItems` property.

In the `drillableItems` property, add an array of `IHeaderPredicate` functions that identifies the measures and
attributes that should become highlighted and drillable.

**Example:** Drilling in a visualization enabled for the measure with either the identifier of `label.owner.department`
or the URI of `/gdc/md/la84vcyhrq8jwbu4wpipw66q2sqeb923/obj/9211`

```jsx
// This is an example of event drilling on the visualization from the GoodSales demo workspace.
import { HeaderPredicates } from "@gooddata/sdk-ui";

function onDrillHandler(event) {
    // handle drill
}

<InsightView
  insight="aby3polcaFxy"
  drillableItems={[
    HeaderPredicates.uriMatch("/gdc/md/la84vcyhrq8jwbu4wpipw66q2sqeb923/obj/9211"),
    HeaderPredicates.identifierMatch("label.owner.department")
  ]}
  onDrill={onDrillHandler}
/>
```

**Example:** Drilling in a visualization enabled for every [arithmetic measure](../../get_raw_data/arithmetic_measure/) that
has a measure with either the identifier set to `label.owner.department` or the URI set
to `/gdc/md/la84vcyhrq8jwbu4wpipw66q2sqeb923/obj/9211` in its tree of measures that the arithmetic measure
is built from

```jsx
// This is an example of event drilling on the visualization from the GoodSales demo workspace.
import { HeaderPredicates } from "@gooddata/sdk-ui";

function onDrillHandler(event) {
    // handle drill
}

<InsightView
  insight="aby3polcaFxy"
  drillableItems={[
    HeaderPredicates.composedFromUri("/gdc/md/la84vcyhrq8jwbu4wpipw66q2sqeb923/obj/9211"),
    HeaderPredicates.composedFromIdentifier("label.owner.department")
  ]}
  onDrill={onDrillHandler}
/>
```

Each event contains an object consisting of `dataView` and `drillContext`. `dataView` contains the underlying data used
to render the chart from which the drill event originates. `drillContext` contains full context of which element the
user clicked.

### Using the catalog-export tool to set up drilling

You can set up the `drillableItems` property via an MD file. To acquire the MD file, use the catalog-export tool and the `HeaderPredicates.objMatch` function. This way, you do not need to search through the exported MD file or gray pages for the measure/attribute identifier or URI.

If the `localIdentifier` property of the measure/attribute does not match, the measure/attribute is checked by its `objRef`. If the matching is done based on the `objRef`, all instances of this measure/attribute will become drillable.

```jsx
// This is an example of event drilling on the visualization from the GoodSales demo workspace.
import { HeaderPredicates } from "@gooddata/sdk-ui";
import * as Md from "../md/full"

function onDrillHandler(event) {
    // handle drill
}

<InsightView
  insight="aby3polcaFxy"
  drillableItems={[
    HeaderPredicates.objMatch(Md.Region),
  ]}
  onDrill={onDrillHandler}
/>
```

## Additional information

For more information, see [Setting up Events for Drilling in Embedded Analytical Designer and KPI Dashboards](https://help.gooddata.com/pages/viewpage.action?pageId=86797116).