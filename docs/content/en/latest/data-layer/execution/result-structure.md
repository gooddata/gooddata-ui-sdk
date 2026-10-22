---
legacy_path: learn/get_raw_data/specify_result_structure
title: Result structure
category: Data layer / Execution
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-model:newDimension"
  - "@gooddata/sdk-model:newTwoDimensional"
  - "@gooddata/sdk-model:MeasureGroupIdentifier"
source_files:
  - src/execution/base/dimension.ts
props_interfaces:
  - ITotal[]
related_pages:
  - /docs/data-layer/execution/execution-model
  - /docs/data-layer/execution/custom-executions
  - /docs/data-layer/execution/table-totals
  - /docs/data-layer/use-execution-data-view
  - /docs/visualisations/pivot-table
type: docs
description: Define execution dimensions, totals, and sorting, then read computed data through execution results, data views, and DataViewFacade.
weight: 83
section: Data layer
subsection: Execution
aliases:
  - "../../learn/get_raw_data/specify_result_structure/"
---

An execution specifies how the Analytical Backend cross-tabulates the result: how it lays out the data into dimensions and how it sorts the data in each dimension.

## Dimensions

The dimensions communicate to the Analytical Backend how to organize data into arrays. Imagine an attribute in columns vs. rows.

Each dimension specifies **items**. These items could be attributes' `localIdentifier`'s or a special `measureGroup` identifier.
The `measureGroup` identifier tells the executor to place all measures from the execution into the dimension.

Each dimension optionally specifies **totals** because the Analytical Backend calculates totals during the cross tabulation as it lays data into the dimensions.

### Default dimensions

By default, an execution created with `forItems` puts the `measureGroup` identifier in the first dimension and all
attributes in the second dimension; if the execution has no measures, it has a single dimension with all attributes.
Executions created with `forBuckets` or `forInsight` derive the dimensions from the buckets. With a single bucket, the
layout is the same as for `forItems`. With several buckets, attributes of the first bucket go to the first dimension and
attributes of the other buckets to the second; `measureGroup` joins the first dimension when the first bucket contains
measures, otherwise the second. To override this behavior, call `withDimensions()` on the prepared execution and
specify the dimensions yourself.

### Creating a dimension specification

You can create a dimension specification using the `newDimension` factory function:

```ts
newDimension(items, totals)
```

where:

-  `items` is an array of attribute `localIdentifier`s, attributes, and/or `MeasureGroupIdentifier` (the `"measureGroup"` string).
-  `totals` is an array of total definitions; this is optional.

The definition and behavior of totals are described in [Table totals](../table-totals/).

The execution's `withDimensions` function takes the dimension specifications as separate arguments (it is variadic, so
spread the array that `newTwoDimensional` returns). You can define either *one* or *two* dimensions.

### Creating a two-dimensional specification

The GoodData.UI execution model provides a convenience function to create a two-dimensional specification:

```ts
newTwoDimensional(firstDimItems, secondDimItems)
```

where:

-  `firstDimItems` are the items that you would normally send to the `newDimension` function; these items will be
   in the first dimension.
-  `secondDimItems` are the items that you would normally send to the `newDimension` function; these items will be
   in the second dimension.

### Examples of dimensions

#### Execution with one measure and one attribute

Use case: one data point calculated from a measure scoped for each attribute value

```ts
import { MeasureGroupIdentifier, newDimension } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

execution()
    .forItems([Md.LocationState, Md.$FranchiseFees])
    .withDimensions(newDimension([Md.LocationState, MeasureGroupIdentifier]));

// The data view holds a one-dimensional array:
// data: [ 32000, 41000, 77000 ]
```

#### Execution with two measures and one attribute

Use case: a simple table; row per attribute value, measures are in columns

```ts
import { MeasureGroupIdentifier, newTwoDimensional } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

execution()
    .forItems([Md.LocationState, Md.$FranchiseFees, Md.$TotalSales])
    .withDimensions(...newTwoDimensional([Md.LocationState], [MeasureGroupIdentifier]));

// data: [
//   [ 32000, 300 ],
//   [ 41000, 345 ],
//   [ 77000, 590 ]
// ]
```

Alternative use case: a simple table; row per measure, one column per attribute value

```ts
import { MeasureGroupIdentifier, newTwoDimensional } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

execution()
    .forItems([Md.LocationState, Md.$FranchiseFees, Md.$TotalSales])
    .withDimensions(...newTwoDimensional([MeasureGroupIdentifier], [Md.LocationState]));

// The result has measures in the first dimension:
// data: [
//   [ 32000, 41000, 77000 ],
//   [ 300, 345, 590 ]
// ]
```

#### Execution with one measure and two attributes

Use case: stacked charts, pivot tables; one attribute used to create rows; one column per measure value calculated for each value of the second attribute

```ts
import { MeasureGroupIdentifier, newTwoDimensional } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

execution()
    .forItems([Md.LocationState, Md.LocationCity, Md.$FranchiseFees])
    .withDimensions(...newTwoDimensional([Md.LocationState], [Md.LocationCity, MeasureGroupIdentifier]));

// data: [
//   [ 13000, 19000 ],  // state of California, one element for each city
//   [ 15000, 26000 ],  // state of Florida, one element for each city
//   [ 31000, 36000 ]   // state of Texas, one element for each city
// ]
```

## Totals

Optionally, you can define totals for each dimension. Totals are used to get aggregated data over several rows or columns of measure data.

For more information about how to define totals, see [Table totals](../table-totals/).

## Sorting

When you are constructing an execution, you can optionally specify what server-sorting to apply. This is done by calling the
`withSorting` function as you are preparing the execution.

```ts
import { MeasureGroupIdentifier, newTwoDimensional, newAttributeSort } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

execution()
    .forItems([Md.LocationState, Md.LocationCity, Md.$FranchiseFees])
    .withDimensions(...newTwoDimensional([Md.LocationState], [Md.LocationCity, MeasureGroupIdentifier]))
    .withSorting(newAttributeSort(Md.LocationState, "desc"));
```

For more information about how to define sorts, see [Execution model](../execution-model/).

## Execution result

GoodData.UI models the execution as a two-phase process. When you start the execution, you almost immediately obtain
the **execution result** (`IExecutionResult`) - or an error in case you did not specify the correct execution. A valid execution result contains
descriptors of the shape and content of dimensions.

For example, if you start an execution for one attribute and one measure and ask for a two-dimensional result with rows for
attribute values and a column for measure, the execution result will contain descriptors for two dimensions. In
each dimension, the descriptor will be the essential detail about the attribute and measure respectively.

Once you have a valid execution result, the Analytical Backend is already running the computation in the background. You can
use the execution result's `readAll` or `readWindow` methods to access all computed data or just a window (page) of the
computed data.

When the data is available, these methods will return an instance of **data view** (`IDataView`). It contains the calculated
`data`, the `headerItems` that describe the data in each dimension, optional `totals`, and the `offset`, `count`, and
`totalCount` of the window you read.

For the in-depth description of the result structures, see the `IExecutionResult` and `IDataView` API reference.

Instead of reading the raw execution results, use the abstractions and convenience methods of `DataViewFacade`.

```ts
import { DataViewFacade } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

const executionResult = await backend
    .workspace("<workspace-id>")
    .execution()
    .forItems([Md.LocationState, Md.$FranchiseFees])
    .execute();
const dataView = await executionResult.readAll();

const facade = DataViewFacade.for(dataView);
```

## Dimensions: quick reference

In the result column, `A1`, `A2`, … are elements of attribute `A`, and `A1-M1` is the value of measure `M1` for element `A1`.

| Items | Dimensions | Result `data` |
|-------|------------|---------------|
| One measure, one attribute (`A`) | `["A", "measureGroup"]` | One array, one value per element of `A`: `[A1, A2, A3]` |
| Two measures (`M1`, `M2`) | `["measureGroup"]` | One array, one value per measure: `[M1, M2]` |
| Two measures (`M1`, `M2`), one attribute (`A`) | `["A", "measureGroup"]` | One array with the cartesian product of the elements of `A` and the measures: `[A1-M1, A1-M2, A2-M1, A2-M2]` |
| Two measures (`M1`, `M2`), one attribute (`A`) | `[]`, `["A", "measureGroup"]` | The same array as in the previous row, wrapped in an outer array: `[[A1-M1, A1-M2, A2-M1, A2-M2]]` |
| Two measures (`M1`, `M2`), one attribute (`A`); typical for a chart with view by | `["A"]`, `["measureGroup"]` | `data[A][M]`, one row per element of `A`: `[[A1-M1, A1-M2], [A2-M1, A2-M2]]` |
| Two attributes (`A`, `B`), one measure (`M1`); typical for a chart with stack by | `["A"]`, `["B", "measureGroup"]` | `data[A][B]`, one row per element of `A`: `[[A1-B1-M1, A1-B2-M1], [A2-B1-M1, A2-B2-M1]]`. With a single measure, it doesn't matter which dimension holds `measureGroup`. |

## Find out more

For more examples, open the [live examples](https://gdui-examples.herokuapp.com/) and watch the Network tab in your browser's developer tools to see the execution requests and result structures the SDK sends and receives.
