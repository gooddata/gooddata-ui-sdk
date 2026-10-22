---
legacy_path: learn/get_raw_data/arithmetic_measure
title: Working with measures
category: Data layer / Data model
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-model:newMeasure"
  - "@gooddata/sdk-model:newArithmeticMeasure"
  - "@gooddata/sdk-model:newPopMeasure"
  - "@gooddata/sdk-model:newPreviousPeriodMeasure"
  - "@gooddata/sdk-model:IMeasure"
  - "@gooddata/sdk-model:newInlineMeasure"
source_files:
  - src/execution/measure/factory.ts
  - src/execution/measure/index.ts
props_interfaces:
  - IPreviousPeriodDateDataSetSimple[]
  - IMeasure
related_pages:
  - /docs/data-layer/data-model/attributes
  - /docs/data-layer/execution/time-over-time
  - /docs/data-layer/execution/execution-model
  - /docs/data-layer/data-model/workspace-catalog
  - /docs/data-layer/data-model/export-catalog
type: docs
description: Create simple measures with newMeasure, arithmetic measures from two operands with newArithmeticMeasure, and inline MAQL measures with newInlineMeasure.
weight: 73
section: Data layer
subsection: Data model
aliases:
  - "../../learn/get_raw_data/arithmetic_measure/"
---

A measure describes a number to compute: a saved measure or a fact from the workspace, a calculation on top of other measures, or a MAQL expression. Every visual component and execution takes `IMeasure` objects, which you create with the factory functions in `@gooddata/sdk-model`.

## Simple measures

`newMeasure` creates a measure from the identifier or `ObjRef` of a saved measure or a fact. The optional second argument is a modifications function that receives a builder:

```ts
import { newMeasure, modifyMeasure, newPositiveAttributeFilter } from "@gooddata/sdk-model";

// A saved measure, with a custom title and format
const revenue = newMeasure("revenue", (m) => m.alias("Revenue").format("$#,##0"));

// A fact, aggregated and shown as a share of the total
const amountShare = newMeasure("f_amount", (m) => m.aggregation("sum").ratio());

// A measure filtered on its own, independently of the execution filters
const westRevenue = newMeasure("revenue", (m) =>
    m.filters(newPositiveAttributeFilter("region", ["West"])).localId("westRevenue"),
);

// Adjust an existing measure; the local identifier is kept
const revenueRounded = modifyMeasure(revenue, (m) => m.format("#,##0"));
```

| Modifier | Effect |
|----------|--------|
| `alias(title)` | Title shown in charts and tables instead of the saved one. |
| `format(format)` | Number format; defaults to the format saved with the measure. |
| `aggregation(agg)` | Aggregation for a fact: `"sum"` (default), `"count"`, `"avg"`, `"min"`, `"max"`, `"median"`, `"runsum"`, or `"approximate_count"`. Ignored for saved measures. |
| `ratio()` | Compute the value as a percentage of the unsliced total. |
| `filters(...filters)` | Attribute or date filters that apply to this measure only. |
| `localId(id)` | Identifier used to reference the measure elsewhere in the execution. Generated from the measure contents when you do not set it. |

`modifyMeasure` works on any measure type and keeps its `localIdentifier`; `modifySimpleMeasure` exposes the simple-measure builder when you need the fact-specific modifiers on an existing measure.

## Arithmetic measures

Arithmetic measures perform simple calculations with measures in a visualization.
An **arithmetic measure** always references two measures; therefore, the visualization must contain at least two measures.

## Supported operations

Although a visualization can contain multiple measures, you can perform arithmetic operations with exactly only **two** measures.

The following arithmetic operations are supported:

| Operation | Arithmetic measure operator | Expression formula | Example
|--- |---|---|---
| Sum | `sum` | =A+B | = Q1 revenue + Q2 revenue
| Difference | `difference` | =A-B | = revenue in 2017 - revenue in 2016
| Product (Multiplication) | `multiplication` |  =A*B | = price per unit * number of units
| Ratio | `ratio` |  =A÷B | = gross profit / net sales
| Change | `change` |  =(A-B)÷B | = (this month revenue - last month revenue) / last month revenue

By default, the result data of a `change` operation is returned as a percentage in the `#,##0.00%` format. The format cannot be overridden.

All the other operations return data in the default `#,##0.00` format.
To change the format, use the `format()` modifier of the measure (see the [examples](#examples)).

## Arithmetic measure structure

To add an arithmetic measure to a visualization, use the `newArithmeticMeasure` factory function:

```ts
newArithmeticMeasure(operands, operator, modifications)
```

An arithmetic measure can reference the following as its **operand**:
* Simple measures
* Derived measures (see [Time-over-time comparison](../../../data-layer/execution/time-over-time/))
* Other arithmetic measures

You can specify operands either by their `localIdentifier` or by their value, and the factory function will extract
the local identifier for you.

The **operator** can be one of the following:
* `sum`
* `difference`
* `multiplication`
* `ratio`
* `change`

The **modifications** part is optional and is a function with a single parameter, which is a builder with the `format()`, `alias()`, and `localId()` modifiers.

If arithmetic measures reference each other in an infinite loop or the referenced measure is not found in the visualization (there is no measure with the referenced *localIdentifier*), the error message is rendered instead of the visualization.

## Examples

### Difference between two measures, referenced by local identifier

When you reference operands by local identifier, set the identifiers explicitly with `localId()`; otherwise the builder generates them and the reference does not resolve.

```tsx
import { newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const measures = [
    // the first simple measure (operand)
    newMeasure("boughtProductsIdentifier", (m) => m.alias("Bought products from supplier").localId("boughtProducts")),
    newMeasure("soldProductsIdentifier", (m) => m.alias("Sold products to customers").localId("soldProducts")),
    newArithmeticMeasure(
        ["boughtProducts", "soldProducts"],
        "difference",
        (m) => m.alias("Products remaining in warehouse"),
    ),
];

export const RemainingProducts = () => <PivotTable measures={measures} />;
```

### Calculation with a derived measure (percentage change between two years)

The result of a `change` operation is returned as a percentage value in the `#,##0.00%` format. This example
demonstrates passing measures by value to the different measure factory functions.

```tsx
import { newMeasure, newPopMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const currentYear = newMeasure("measureIdentifier", (m) => m.alias("Current Year"));
// derived - data from previous year; the second argument is the year attribute
const previousYear = newPopMeasure(currentYear, "yearAttributeIdentifier", (m) => m.alias("Previous Year"));
// arithmetic measure; operands are the measures themselves
const change = newArithmeticMeasure([currentYear, previousYear], "change", (m) => m.alias("Change between years"));

const measures = [currentYear, previousYear, change];

export const YearOverYearChange = () => <PivotTable measures={measures} />;
```

## Inline MAQL measures

An inline measure carries its MAQL expression in the execution instead of referencing a measure saved in the
workspace. Use it when the expression depends on user input, for example, a threshold or a parameter, and saving a
measure for every variant is not practical.

Create one with `newInlineMeasure`, and adjust it with `modifyInlineMeasure`:

```ts
import { isInlineMeasure, modifyInlineMeasure, newInlineMeasure } from "@gooddata/sdk-model";

const largeDeals = newInlineMeasure("SELECT SUM({fact/f_opportunitysnapshot.f_amount}) WHERE {fact/f_opportunitysnapshot.f_amount} > 100000");

const largeDealsFormatted = modifyInlineMeasure(largeDeals, (m) => m.alias("Large deals").format("#,##0"));

isInlineMeasure(largeDealsFormatted); // true
```

The expression is sent to the analytics engine as written. Object identifiers in MAQL use the `{type/identifier}`
form; see [MAQL](https://www.gooddata.ai/docs/cloud/create-metrics/maql/) in the GoodData Cloud documentation
for the language.

Inline measures work everywhere an `IMeasure` does: chart props, `Execute`, and execution definitions.

- The measure is not saved. Other users and other visualizations cannot reuse it, and it does not appear in the
  catalog.
- Referencing another measure inside the expression works with `{metric/identifier}`.
- Validation happens on the analytics engine. A typo surfaces as a `BAD_REQUEST` error at execution time; see
  [Handle errors](../../../integrations/interactivity/handle-errors/).

## Props

{{% props %}}
