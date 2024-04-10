---
title: "Create Custom Visualizations"
linkTitle: "Create Custom Visualizations"
icon: "visualize.svg"
weight: 80
no_list: true
---

With GoodData.UI, you can create a new, customized visual components to address your specific analytics needs.

> Before you start with creation of the custom visualizations, ensure that you are already familiar with the [execution model](../../get_raw_data/execution_model/).
> We also recommend to use the [export catalog](../export_catalog/) tool for more natural and readable way to specify the result data.

## Get custom visualization data
To specify and obtain the custom visualization data, you can use the following React [hooks](#react-hooks) and [components](#react-components), or [execution API](#execution-api).

Components and hooks have similar API(s) and capabilities, so use your preferred approach.
However, for more complex scenarios (for example, when one execution depends on another), we recommend using hooks to avoid unnecessary nesting of the components.

### React hooks

- `useExecutionDataView` hook allows you to specify and obtain the result data for your custom visualizations with convenient API.
    You can specify data to obtain with [series and slices](#access-custom-visualization-data) (recommended) or [custom execution](../../get_raw_data/execution_model/).
    It fetches the result data for you and informs you about the loading status or error if there are any.

- `useInsightDataView` hook allows you to fetch data for an existing visualization created in [Analytical Designer](https://help.gooddata.com/pages/viewpage.action?pageId=86794494) and render it with your custom visualization.
    It fetches the result data for you and informs you about the loading status or error if there are any.
    It is basically [InsightView](../insightview/), but without the view part.

### React components
- `Execute` is a component alternative to the `useExecutionDataView` hook. You can specify data to obtain with [series and slices](#access-custom-visualization-data).
    It fetches the result data for you and informs you about the loading status or error if there are any.

- `RawExecute` is a component alternative to `useExecutionDataView` hook. You can specify data to obtain with [custom execution](../../get_raw_data/execution_model/).
    It fetches the result data for you and informs you about the loading status or error if there are any.

- `ExecuteInsight` is a component alternative to `useInsightDataView` hook.
    It allows you to fetch data for an existing visualization created in [Analytical Designer](https://help.gooddata.com/pages/viewpage.action?pageId=86794494) and render it with your custom visualization.
    It fetches the result data for you and informs you about the loading status or error if there are any.
    It is basically [InsightView](../insightview/), but without the view part.

### Execution API

If you cannot or do not want to use hooks and components mentioned above, you can obtain visualization data directly from the `@gooddata/sdk-backend-*` instance. Read more details about [custom executions](../../get_raw_data/execution_model/).

## Access custom visualization data

The concept of data series and data slices used by the execution hooks and components is best explained in some real-life examples.

### Tabular data

Imagine that you want to create a custom table component. This component should show one row for each value of the
attribute `A1`. In each row, there should be two columns, one for the measure `M1` and one for the measure `M2`.

In this scenario, the data series are the two measures `M1` and `M2`, and the slices are defined from the attribute `A1`.

Now, imagine that this typical table must become more dynamic. For each value of the attribute `A2`, the table must include two columns: one for each measure, `M1` and `M2`.

In this scenario, the data series are measures `M1` and `M2`, **scoped** to values of the attribute `A2`. And on top of it,
these columns are sliced by values of the attribute `A1`.

### Scalars

Imagine that you want to create a custom KPI component. This component should show a couple of key performance indicators,
each calculated from a different measures: `M1`, `M2`, and `M3`.

In this scenario, the data series are the measures `M1`, `M2`, and `M3`, and there are no data slices at all.

## Working with the results

The instance of the result contains several methods for convenient data access.

-   You can access the result by data series by calling the `result.data().series()`.
-   You can access the result by data slices by calling the `result.data().slices()`.
-   These methods return a collection of series and slices respectively.
-   You can either iterate the items from the collection using the `for-of` loop or transform it to an array and then use the typical array mapping and manipulation functions of JavaScript.
-   For each series or slice item, you can then iterate the available data points.
    -   Iterating data points for a series gives you one data point per slice.
    -   Iterating data points for a slice gives you one data point per series.
-   Each data point contains both data and all available metadata (series descriptor, slice descriptor). You can
    access either the raw data or formatted data.

**NOTE**: While the result instance exposes the raw results from the backend, we strongly discourage you from accessing
the raw data.
