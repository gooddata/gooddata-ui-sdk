---
title: Custom Executions
titleLink: Custom Executions
copyright: (C) 2007-2018 GoodData Corporation
weight: 11
---

<!-- Bear specific? -->

An **execution** is a combination of attributes, measures, and filters that describes what data you want to calculate.

> A measure contains numeric data (for example, revenue). Measures can be sliced by selected attributes (for example, city, date in years, or both) and filtered by attribute values or date constraints. For more information, see the [main concepts](../../get_raw_data/#measures-attributes-and-filters).

## End-to-end flow

You can use an instance of the Analytical Backend to conveniently construct and perform the executions using a fluent API.

```javascript
import tigerFactory from "@gooddata/sdk-backend-tiger";
import { newPositiveAttributeFilter, newMeasureSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import * as Md from "./md/full";

const backend = tigerFactory();

// The execution will be done for single measure and on granularity of single attribute.
const measuresAndAttributes = [Md.$AvgDailyTotalSales, Md.LocationState];

// This filter tells backend to calculate data just for the listed states.
const filter = newPositiveAttributeFilter(Md.LocationState, ["California", "Texas", "Oregon"])

// This sort definition tells backend to sort the result by value of the $AvgDailyTotalSales
const sort = newMeasureSort($AvgDailyTotalSales, "desc");

// The dimensions specify how to slice and dice the result. In this example the result will be two dimensional
// and resemble a table. There will be one row for each state and in each row there will be one columns for measure.
const dimensions = newTwoDimensional([Md.LocationState], [MeasureGroupIdentifier]);

const result = await backend
   .workspace("workspace_id")
   .execution()
   .forItems(measuresAndAttributes, [filter])
   .withSorting(...sort)
   .withDimensions(...dimensions)
   .execute();

const firstPage = await result.readWindow([0, 0], [10, 10]);
const allData = await result.readAll();
```

The structure of data that you obtain from execution result is fairly complex. GoodData.UI provides a convenience
layer to work with the result data. It is called `DataViewFacade` and is available from the `@gooddata/sdk-ui` package.

The `DataViewFacade` wraps the data view that you obtain from the execution result using either `readWindow` or `readAll` methods
and exposes the data as data series that may be further scoped for some attributes and slices by other attributes.

Building on top of the previous example, you can use `DataViewFacade` as follows:

```javascript
import { DataViewFacade } from "@gooddata/sdk-ui"
import * as Md from "./md/full";
import first from "lodash/first"

const facade = DataViewFacade.for(allData);

// Gets a collection of all data series found in the data. There will be exactly one series for the $AvgDailyTotalSales
const allDataSeries = facade.data().series();

// Gets first (and in this case only) data series calculated for the $AvgDailyTotalSales measure.
//
// Note that if you set up the execution dimensionality so that one dimension contains both MeasureGroupIdentifier and
// an attribute, then the result may contain multiple data series for the $AvgDailyTotalSales. Each of the data
// series will be _scoped_ to a an element of the attribute for which it was calculated.
const totalSales = allDataSeries.firstForMeasure(Md.$AvgDailyTotalSales);

// The series contains one data point per slice. There will be one slice for each attribute element in the
// dimension opposite to the dimension that contains the MeasureGroupIdentifier. In this case that attribute
// is LocationState and is filtered to contain values of "California", "Texas" and "Oregon". There will be
// one slice for each state.
//
// This mapping returns an array with one object for each state for which the value of the $AvgDailyTotalSales measure
// was calculated. The value is returned as a string formatted using format string defined for the measure.
const totalSalesByState = totalSales.dataPoints().map(dataPoint => {
    return {
        state: first(dataPoint.sliceDesc.sliceTitles()),
        sales: dataPoint.formattedValue()
    };
});

```

To learn more about sorting and dimensionality, see [Specify the Result Structure](../specify_result_structure/).
