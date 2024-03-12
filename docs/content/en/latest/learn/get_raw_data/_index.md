---
title: "Get Raw Data"
linkTitle: "Get Raw Data"
icon: "icon-react.svg"
weight: 15
no_list: true
---

Before you start building your first analytical application with GoodData.UI, take a few more minutes to understand
the core concepts behind computing and rendering data using GoodData.UI.

## Overview

GoodData.UI offers a foundation that covers an entire life cycle of data to be visualized:

1.  [Specification](#measures-attributes-and-filters) of what data to compute
2.  APIs to asynchronously compute the data according to the specification
3.  APIs to access the computed results
4.  APIs to transform the results and perform client-side post-processing

This foundation is suitable for building your own visualization components or addressing custom analytics
use cases.

On top of this foundation, the GoodData.UI builds different React components with convenient public APIs. The
React components are responsible for:

-  Constructing a valid data specification
-  Driving the computation on the Analytical Backend
-  Rendering the data or, alternatively, exposing data to render using your own custom visual component

We recommend that you start your GoodData.UI journey by using the existing React visual components; you can find documentation for these existing React visual components in the menu on the left in the reference section.

The remainder of this document describes essentials of data specification which is all you need to know before
you start using the visual components.

You can learn more about the lower level, non-React APIs in [Custom Executions](./custom_executions/).

### How to specify data to render

At the lowest level of every data visualization in GoodData.UI is the specification of what data to calculate on the
backend so that it can be visualized. We call this specification the _Execution Definition_.

The execution definition captures the following:

-  What the **measures** to calculate
-  For which **attributes** these measures should be calculated
-  What **filters** to apply
-  How to **slice and dice** the result
-  What **totals** and rollups to include in the result
-  How to **sort** the result

All the visualization components in GoodData.UI create the execution definition, use it to start an
execution on an Analytical Backend. Then, from the execution result they load views of the data to visualize.

The visual components in GoodData.UI provide a convenience layer and shield you from creating
a potentially complex execution definitions. You do not have to carefully craft the full execution definition for, let's say,
`ColumnChart` that you place into your application.

Instead, you specify what measures you are interested in, what attribute should be used to create columns and what
attribute should be used to stack the columns. Given this input, the visualization will craft the full execution definition
and drive it to obtain the data to visualize.

### Measures, attributes, and filters

These are best described with an example. Imagine you are an account manager for a Franchise network.
You want to know the **average daily amount** of money for each **Franchise office** in the **USA**.

Let's introduce the main concepts:

* A **measure** is a computational expression that aggregates one or more numerical values. In this example, you are interested in the **average daily amount**.
* An **attribute** breaks the measure apart and provides context to the data. In this example, the measure is sliced by the **location** of the Franchise offices.
* A **filter** is a set of conditions that removes specific values from your original data. In this example, you want to see only **USA-specific locations**.

Let's display your data as a column chart:

![Column Chart](/gd-ui/intro_column_chart.png "Column Chart")

The chart shows the elements (measure, attribute, filter) that together work as unified input for creating a **visualization** using GoodData.UI, which is a view into a specific part of your data.

In the column chart:

* `$ Avg Daily Total Sales` is a **measure**.
* `Location State` is an **attribute**.
* A **filter** applied to the chart shows only USA-specific values of `Location State`, which represent the offices located in the USA.

### Where do measures and attributes come from?

GoodData Cloud and GoodData.CN both implement a concept of workspaces. A workspace defines a **logical data model** (LDM)
and is linked to the data source that contains data conforming to this LDM.

The workspace LDM consists of datasets that are composed of facts and attributes. Additionally, the workspace may define
complex measures using the powerful **Multi-Dimensional Analytical Query Language** ([MAQL](https://www.gooddata.com/docs/cloud/create-metrics/maql/)). These complex measures work on top
of the facts and attributes in your LDM.

The LDM and complex MAQL measures essentially form a semantic layer on top of your data. This semantic layer hides a
lot of complexity that you may typically encounter when directly constructing SQL queries.

The semantic layer then exposes the available datasets, attributes, facts, and complex MAQL measures that you can use in your application to specify what data to visualize.

Each of the semantic layer entities has their own identifier. When your application renders visual components, the props
that specify measures and attributes always reference the semantic layer entity and provide additional information on
top of it.

## Attributes and measures in your application

Once you have a GoodData Cloud or GoodData.CN workspace that has the LDM and potentially complex MAQL measures,
you can start building an application using GoodData.UI.

The attributes, measures, filters, sorting, totals, slicing and dicing are all covered by different types of the execution model
that is implemented in `@gooddata/sdk-model`.
Instances of these types is what the visual components accept are their props.

The execution model comes with factory functions to create instances of any types that play a role in the model. For
example, to define a new measure that you can then use as input for the `ColumnChart` component, you would do something similar to the following:

```javascript
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

const myMeasure = newMeasure("measureIdentifier");
const myAttribute = newAttribute("attributeDisplayFormIdentifier");
```

Where:

-  `measureIdentifier` is the identifier of either a fact in your LDM or a complex MAQL measure defined on top of the LDM.

-  `attributeLabelIdentifier` is the identifier of a display form (label) of an attribute in your LDM.

Once you have an instance of the measure defined, you can use it to create a visual component:

```jsx
import { ColumnChart } from "@gooddata/sdk-ui-charts";

function MyColumnChart() {
    return (
        <ColumnChart measures={[myMeasure]} viewBy={[myAttribute]}/>
    );
}
```

### Generating code representation of the semantic layer

Manually creating measures and attributes can be time-consuming, especially when your LDM is large.

We have created the [`catalog-export`](../visualize_data/export_catalog/) tool to help with this. The tool can connect to either GoodData Cloud or GoodData.CN and transform the entities in the semantic layer of your
workspace into code representation.

The tool retrieves the LDM and complex MAQL measures from your workspace and generates a file in either JavaScript or
TypeScript that will contain code constants for all the semantic layer entities. You can then import the definitions
from this file and use them directly.

For example:

```jsx
import { $AvgDailyTotalSales, LocationState } from "./generatedMd";
import { ColumnChart } from "@gooddata/sdk-ui-charts";

function MyColumnChart() {
    return (
        <ColumnChart measures={[$AvgDailyTotalSales]} viewBy={[LocationState]}/>
    );
}
```

**NOTE**: You can run `@gooddata/catalog-export` any time to refresh the contents of the generated file.

## Summary

You specify what data to render by referencing attributes or measures defined in your workspace. The simplest way
to get started is to use the [catalog-export](../visualize_data/export_catalog/) tool that will generate a file with
code representation of all essential entities in your workspace.

The execution model in GoodData.UI offers additional functionality. You can learn more about it in the
[detailed description](./execution_model/).