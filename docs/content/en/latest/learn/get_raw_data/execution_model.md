---
title: Execution Model Details
sidebar_label: Detailed Description
copyright: (C) 2020 GoodData Corporation
id: execution_model
---

The execution model of GoodData.UI is used to specify what data to compute on an Analytical Backend. Parts of the model
are also used as input to the visual components to tell them what data to obtain and render.

This document builds up on the [execution model basics](../custom_executions/) and goes into more detail about
the available types and functions available for their creation and manipulation.

## Execution model concepts

To simplify the creation of various types of objects that specify what data to render, the model uses a combination
of two typical object creation patterns: factory function and builder.

### Creating objects

The model provides a single factory function to create each type of objects. There are several conventions:

-  The factory functions are always named `new<ObjectType>`.
-  The factory functions can create only syntactically valid objects; all essential object parameters are required
   arguments to the function call.
-  For simple objects, optional parameters follow the required arguments.
-  For complex objects (such as measures), the last parameter is a `modifications` function which you can implement.
   This function will receive an instance of the builder with methods to customize different parameters of the object
   under construction.

### Accessing object properties

The model provides accessor functions to access object properties. The naming convention for an accessor function is `<objectType>Property(object)`, where the first and only parameter is the object to access.

**Examples:** `attributeAlias`, `measureLocalId`, `measureFormat`, `filterAttributeElements`

### Modifying objects

The model provides specialized functions to allow modification of complex objects: measures and attributes. There
are several conventions:

-  The modification functions are always named `modify<ObjectType>`.
-  The first parameter is the object to modify.
-  The second parameter is the modification function. This function will receive an instance of the builder with methods
   to customize different parameters of the object.
-  The modification functions treat input as immutable. They will create new objects instead of modifying the
   inputs.

### Local identifiers and referencing objects

The `localIdentifier`, or `localId` for short, is a user-assigned identifier that you have to use when referencing
attributes and measures in the scope of a single visualization or execution.

The execution model automatically generates stable `localId`'s as it creates the attribute and measure objects. You can pass the attribute and measure objects by its value. However, if you want to use the same attribute or measure multiple times in the same visualization, you have to create a copy of the object and assign it a different `localId` yourself.

You can use the `modify<ObjectType>` functions to override the `localId` of an attribute or measure. The builder instances that your modification function receives have functions to manipulate `localId`. The behavior of the modification functions in regards to `localId` is as follows:

-  If you call `m => m.defaultLocalId()`, the default logic for `localId` generation will kick in **after** all
   other object modifications are applied.

-  If you call `m => m.localId(customValue)`, the modified object will have your custom `localId`.

-  If you do not call `defaultLocalId` or `localId`, the modification object will have the same `localId` as the
   original object.

## Attribute

Each attribute is defined by its `displayForm` - also known as `label` in GoodData Cloud and GoodData.CN - that will be used to
slice the data. You can create an attribute definition using the following factory function:

```javascript
    const attribute = newAttribute("<attribute-displayForm-identifier>");
```

Each attribute requires a `localIdentifier` that you can use to reference the attribute in the scope of the execution (for instance, when specifying sorting). The factory function assigns a stable `localIdentifier` for you.

You can optionally override the `localIdentifier` and also the title of the attribute in the factory function call:

```javascript
    const attribute = newAttribute("<attribute-displayForm-identifier>", m => m.localId("myLocalId").alias("My Attribute"));
```

You can modify an existing attribute using the `modifyAttribute` function:

```javascript
import { newAttribute, modifyAttribute } from "@gooddata/sdk-model";

const attribute = newAttribute("displayFormIdentifier", m => m.alias("My Custom Name"));

// notice the call to defaultLocalId() - this ensures the new object will have a different, generated localId
const sameAttributeDifferentName = modifyAttribute(attribute, m => m.alias("Corrected Name").defaultLocalId());
```

## Filter

You can limit the execution by providing one or more `filter`'s. Multiple filters are always interpreted as an intersection of all individual filters \(`f1 AND f2 AND f3...`).

The execution model provides several factory functions to create filter objects, one function for each type of filters supported by GoodData.UI:

-  `newPositiveAttributeFilter`
-  `newNegativeAttributeFilter`
-  `newAbsoluteDateFilter`
-  `newRelativeDateFilter`
-  `newMeasureValueFilter`
-  `newRankingFilter`

## Measure

Measures in the scope of execution indicate what values the Analytical Backend must calculate and include in the result,
potentially sliced as indicated by the different attributes in the execution.

You can construct measures of multiple types:

-  Measures created by aggregating facts in your logical data model
-  Measures created by referencing an existing, potentially complex MAQL metric
-  Arithmetic measures constructed by combining existing measures as operands of arithmetic operations
-  Time-over-time comparison measures constructed by "shifting" the calculation in time

The factory functions are the following:

-  `newMeasure` creates a new measure from a fact or a MAQL metric.
-  `newArithmeticMeasure` creates a new arithmetic measure.
-  `newPopMeasure` creates a new period-over-period comparison measure.
-  `newPreviousPeriodMeasure` creates a new previous period comparison measure.

The modification function is `modifyMeasure`. It modifies measure-agnostic parameters (format, alias, localId) of any type of a measure.

**Example:**

```js harmony
import { newMeasure, newArithmeticMeasure, modifyMeasure } from "@gooddata/sdk-model";

const measureFromMaqlMetric = newMeasure("maqlMetricIdentifier");
const measureFromFact = newMeasure("factIdentifier", m => m.aggregation("avg").alias("Custom Name"));
const measureWithFilter = newMeasure("factIdentifier", m => m.filters(newPositiveAttributeFilter("displayFormId", ["value"])));

const arithmeticMeasure = newArithmeticMeasure(
                                [measureFromFact, measureFromMaqlMetric],
                                "sum",
                                m => m.alias("Custom Name For Arithmetic Measure").format("$#,#0.0")
                          );

// notice the call to defaultLocalId; this ensures that this new measure will have a different localId - one that reflects
// that the title and the format is different.
const modifiedArithmeticMeasure = modifyMeasure(arithmeticMeasure,
                                    m => m.alias("Different Name For Arithmetic Measure").format("$#,#0").defaultLocalId()
                                  );
```

> You can find examples for the other factory functions together with a detailed description of time-over-time comparison measures in [Time-over-Time Comparison](../../add_interactivity/time_over_time/). The
arithmetic measures are described in [Arithmetic Measure](../arithmetic_measure/).

### Aggregation inside a measure

Each measure created from a fact can specify `aggregation` of data. Aggregation is represented by a string value that defines the aggregation type.

| Type | Description |
| :--- | :--- |
| `"sum"` | Returns a sum of all numbers in the set |
| `"count"` | Counts unique values of a selected attribute in a given dataset determined by the second attribute parameter  (ignores the measure's `format` value and uses the default value `#,##0` instead) |
| `"avg"` | Returns the average value of all numbers in the set; null values are ignored |
| `"min"` | Returns the minimum value of all numbers in the set |
| `"max"` | Returns the maximum value of all numbers in the set |
| `"median"` | Counts the statistical median - an order statistic that gives the "middle" value of a sample. If the "middle" falls between two values, the function returns average of the two middle values. Null values are ignored. |
| `"runsum"` | Returns a sum of numbers increased by the sum from the previous value \(accumulating a sum incrementally\) |

### Filters in a measure definition

Each measure can be filtered by attribute filters. Filters are represented by an array of `IFilter` objects.

Only one filter of the `DateFilter` type is allowed in the measure's filter definition.

* When both the measure filter of the `DateFilter` type and the global filter of the `DateFilter` type are set with
  the **same** date dimension, the measure date filter overrides the global date filter for this measure
  \(global date filters are still applied to other measures that do not have a measure date filter defined\).
* When the measure filter of the `DateFilter` type and the global filter of the `DateFilter` type are set
  with **different** date dimensions, the filters are interpreted as an intersection of those filters (`f1 AND f2`).

### Show a measure as a percentage

When the execution runs on the Analytical Backend, the result measure data is, by default, returned as raw values \(numbers\).

If you want the measures data to be displayed as a percentage instead, you can use the `modifySimpleMeasure` function
of the execution model to turn on the `computeRatio` functionality:

```javascript
import { modifySimpleMeasure } from "@gooddata/sdk-model";
import * as Md from "./md/full";

// This will modify an existing simple measure, turn on the computeRatio functionality and associate a new, default localId
const ratioMeasure = modifySimpleMeasure(Md.$FranchiseFees, m => m.ratio().defaultLocalId());

// This will modify an existing simple measure, turn off the computeRatio functionality and associate a new, default localId
const noRatio = modifySimpleMeasure(ratioMeasure, m => m.noRatio().defaultLocalId());
```

When the property is enabled, the measure's `format` value is ignored. The default format `#,##0.00%` is used instead.

## Sort items

The execution model provides factory functions to create sort items and the respective locators:

- `newAttributeSortItem` creates a new attribute sort item.
- `newMeasureSortItem` creates a new measure value sort item.

For both of these, you can specify an attribute or measure either by `localId` or by passing the actual object.

The second parameter is always the sort direction.

When sorting by measures that are scoped for a particular attribute value (for example, in pivot tables), you must specify one or more attribute locators to pinpoint the exact measure to sort by. You can conveniently create attribute locators using the `newAttributeLocator` factory function.

**Example:**

```js harmony
import { newAttribute, newMeasure, newAttributeSort, newMeasureSort, newAttributeLocator } from "@gooddata/sdk-model";

const attribute = newAttribute("displayFormIdentifier", m => m.alias("Custom Dimension"));
const measure = newMeasure("maqlMetricIdentifier", m => m.alias("My Measure").format("#0"));

const attributeSort = newAttributeSort(attribute, "asc");

const measureSortWithoutAttributeLocator = newMeasureSort(measure, "asc");
const measureSortWithAttributeLocator = newMeasureSort(measure, "asc", [newAttributeLocator(attribute, "element-uri")])
```

### Attribute area sorting

You can specify that the attribute sort should sort attribute values based on an aggregation function applied to
all valid values belonging to each attribute value. This is extremely useful when sorting stacked visualizations such
as stacked bar charts or area charts.

Currently, only sorting by the `sum` function is supported.

The following example shows sorting a table with two measures and a `Year` attribute. You can set sorting based on the `Year` attribute with:

```javascript
import { newAttribute, newAttributeAreaSort } from "@gooddata/sdk-model";

const attribute = newAttribute("displayFormIdentifier", m => m.alias("Custom Dimension"));

newAttributeAreaSort(attribute, "asc")
```

Consider the following original data:

| Year | 2006 | 2006 | 2007 | 2007 |
| :--- | :--- | :--- | :--- | :--- |
| Measures | M1 | M2 | M1 | M2 |
| Values | 1 | 2 | 3 | 4 |

The sorting function (`sum`) is applied to all attribute element values for each attribute element (`2006` and `2007`).
Notice that the area sort is summing up values across different measures (`M1` and `M2`):

| 2006 | 2007 |
| :--- | :--- |
| 1 + 2 = 3 | 3 + 4 = 7 |

Attribute values are then sorted by this computed value (`3` and `7`, respectively):

| Year | 2007 | 2007 | 2006 | 2006 |
| :--- | :--- | :--- | :--- | :--- |
| Measures | M1 | M2 | M1 | M2 |
| Values | 3 | 4 | 1 | 2 |