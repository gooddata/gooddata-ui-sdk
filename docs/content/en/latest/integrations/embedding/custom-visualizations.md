---
legacy_path: learn/visualize_data/create_custom_visualizations
title: How custom visualizations get data
category: Integrations / Embedding
diataxis_type: explanation
api_symbols:
  - "@gooddata/sdk-ui:useExecutionDataView"
  - "@gooddata/sdk-ui:useInsightDataView"
source_files:
  - src/execution/useExecutionDataView.ts
  - src/execution/useInsightDataView.ts
related_pages:
  - /docs/data-layer/use-execution-data-view
  - /docs/data-layer/execute
  - /docs/integrations/embedding/build-custom-frontend
  - /docs/data-layer/execution/result-structure
  - /docs/integrations/interactivity/handle-errors
type: docs
description: Understand the hooks, components, and backend API that feed custom visualizations, and how series, slices, and data points structure the result.
weight: 79
section: Integrations
subsection: Embedding
aliases:
  - "../../learn/visualize_data/create_custom_visualizations/"
---

With GoodData.UI, you can build your own visual components on top of GoodData data. This page explains the data side: which APIs fetch the data, how to describe what you need, and how to read the result. For a worked example that also replaces the filters and adds an export, follow [Build a fully custom frontend](../build-custom-frontend/).

{{% alert color="info" %}}
This page builds on the [execution model](../../../data-layer/execution/execution-model/). The [catalog-export](../../../data-layer/data-model/export-catalog/) tool generates typed constants for your measures and attributes, which make the data specification easier to read.
{{% /alert %}}

## Ways to get the data

You can get the data for a custom visualization with React [hooks](#react-hooks), React [components](#react-components), or the [execution API](#execution-api).

Hooks and components have similar APIs and capabilities. For more complex scenarios, for example when one execution depends on another, hooks avoid nesting components inside each other.

### React hooks

- [`useExecutionDataView`](../../../data-layer/use-execution-data-view/) fetches the data you describe with [series and slices](#series-and-slices) or with a [custom execution](../../../data-layer/execution/execution-model/), and reports the loading status and errors.
- [`useInsightDataView`](../../../data-layer/use-insight-data-view/) fetches the data of a visualization saved in [Analyze](https://www.gooddata.ai/docs/cloud/create-visualizations/), so you can render it with your own component. It's [`InsightView`](../../../visualisations/insightview/) without the view part.

### React components

- [`Execute`](../../../data-layer/execute/) is the component counterpart of `useExecutionDataView` for data described with [series and slices](#series-and-slices).
- [`RawExecute`](../../../data-layer/raw-execute/) is the component counterpart of `useExecutionDataView` for a [custom execution](../../../data-layer/execution/execution-model/).
- [`ExecuteInsight`](../../../data-layer/execute-insight/) is the component counterpart of `useInsightDataView`: it fetches the data of a saved visualization.

Each of them fetches the result and reports the loading status and errors.

### Execution API

Without hooks or components, you can get the data directly from the analytical backend instance. See [custom executions](../../../data-layer/execution/execution-model/).

## Series and slices

The execution hooks and components describe the data as series and slices. Two examples show how they relate.

### Tabular data

Imagine a custom table component that shows one row for each value of the attribute `A1`. Each row has two columns, one for the measure `M1` and one for the measure `M2`.

Here, the data series are the two measures `M1` and `M2`, and the slices come from the attribute `A1`.

Now the table becomes more dynamic: for each value of the attribute `A2`, it includes two columns, one for each measure, `M1` and `M2`.

Here, the data series are the measures `M1` and `M2`, **scoped** to the values of the attribute `A2`. On top of that, these columns are sliced by the values of the attribute `A1`.

### Scalars

Imagine a custom headline component that shows several key figures, each calculated from a different measure: `M1`, `M2`, and `M3`.

Here, the data series are the measures `M1`, `M2`, and `M3`, and there are no data slices at all.

## Working with the results

The result instance has methods for convenient data access:

- `result.data().series()` returns the result as a collection of data series.
- `result.data().slices()` returns the result as a collection of data slices.
- You can iterate a collection with a `for-of` loop, or turn it into an array and use the usual array functions.
- For each series or slice, you can iterate its data points:
    - Iterating the data points of a series gives you one data point per slice.
    - Iterating the data points of a slice gives you one data point per series.
- Each data point holds the data and the metadata: the series descriptor and the slice descriptor. You can read either the raw or the formatted value.

{{% alert color="warning" title="Avoid the raw backend result" %}}
The result instance also exposes the raw result from the backend. Its structure is an implementation detail, so read the data through series and slices instead.
{{% /alert %}}
