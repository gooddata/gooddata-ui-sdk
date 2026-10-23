---
legacy_path: learn/get_raw_data/custom_executions
title: Run a custom execution
category: Data layer / Execution
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-model:newDefForItems"
source_files:
  - src/execution/executionDefinition/factory.ts
props_interfaces:
  - IAttributeOrMeasure[]
related_pages:
  - /docs/data-layer/execution/execution-model
  - /docs/data-layer/execution/result-structure
  - /docs/data-layer/use-execution-data-view
  - /docs/integrations/embedding/custom-visualizations
  - /docs/integrations/interactivity/handle-errors
description: Build custom executions with attributes, measures, filters, sorting, and dimensions via the Analytical Backend fluent API.
ai_generated_description: true
type: docs
weight: 82
section: Data layer
subsection: Execution
aliases:
  - "../../learn/get_raw_data/custom_executions/"
---

An **execution** is a combination of attributes, measures, and filters that describes what data you want to calculate.

{{% alert color="info" %}}
A measure contains numeric data (for example, revenue). Measures can be sliced by selected attributes (for example, city, date in years, or both) and filtered by attribute values or date constraints. For more information, see [Execution model](../execution-model/).
{{% /alert %}}

## End-to-end flow

Use an instance of the Analytical Backend to build and run the execution with a fluent API. This fluent client wraps GoodData's [raw-data REST API](https://www.gooddata.ai/docs/cloud/api-and-sdk/api/access_raw_data_through_api/): `.execution()` maps to the execute endpoint, and reading the result maps to the result endpoint.

```ts
import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";
import { newPositiveAttributeFilter, newMeasureSort, newTwoDimensional, MeasureGroupIdentifier } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const backend = tigerFactory()
    .onHostname("https://example.gooddata.com")
    .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));

// The execution will be done for a single measure and on the granularity of a single attribute.
const measuresAndAttributes = [Md.$AvgDailyTotalSales, Md.LocationState];

// This filter tells the backend to calculate data just for the listed states.
const filter = newPositiveAttributeFilter(Md.LocationState, ["California", "Texas", "Oregon"]);

// This sort definition tells the backend to sort the result by the value of $AvgDailyTotalSales.
const sort = newMeasureSort(Md.$AvgDailyTotalSales, "desc");

// The dimensions specify how to slice and dice the result. In this example the result will be two-dimensional
// and resemble a table: one row for each state, and in each row one column for the measure.
const dimensions = newTwoDimensional([Md.LocationState], [MeasureGroupIdentifier]);

const result = await backend
   .workspace("workspace_id")
   .execution()
   .forItems(measuresAndAttributes, [filter])
   .withSorting(sort)
   .withDimensions(...dimensions)
   .execute();

// readWindow takes zero-based offsets and sizes, one per dimension.
const firstPage = await result.readWindow([0, 0], [10, 10]);
const allData = await result.readAll();
```

The structure of data that you obtain from execution result is fairly complex. GoodData.UI provides a convenience
layer to work with the result data. It is called `DataViewFacade` and is available from the `@gooddata/sdk-ui` package.

The `DataViewFacade` wraps the data view that you obtain from the execution result using either `readWindow` or `readAll` methods
and exposes the data as data series that may be further scoped for some attributes and slices by other attributes.

Building on top of the previous example, you can use `DataViewFacade` as follows:

```ts
import { DataViewFacade } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

const facade = DataViewFacade.for(allData);

// Gets a collection of all data series found in the data. There will be exactly one series for the $AvgDailyTotalSales
const allDataSeries = facade.data().series();

// Gets first (and in this case only) data series calculated for the $AvgDailyTotalSales measure.
//
// Note that if you set up the execution dimensionality so that one dimension contains both MeasureGroupIdentifier and
// an attribute, then the result may contain multiple data series for the $AvgDailyTotalSales. Each of the data
// series will be _scoped_ to an element of the attribute for which it was calculated.
const totalSales = allDataSeries.firstForMeasure(Md.$AvgDailyTotalSales);

// The series contains one data point per slice. There will be one slice for each attribute element in the
// dimension opposite to the dimension that contains the MeasureGroupIdentifier. In this case that attribute
// is LocationState and is filtered to contain values of "California", "Texas" and "Oregon". There will be
// one slice for each state.
//
// This mapping returns an array with one object for each state for which the value of the $AvgDailyTotalSales measure
// was calculated. The value is returned as a string formatted using the format string defined for the measure.
const totalSalesByState = totalSales.dataPoints().map((dataPoint) => {
    return {
        state: dataPoint.sliceDesc?.sliceTitles()[0],
        sales: dataPoint.formattedValue(),
    };
});
```

To learn more about sorting and dimensionality, see [Result structure](../result-structure/). For other ways to authenticate, see [Authenticate to the backend](../../../integrations/authentication/).
