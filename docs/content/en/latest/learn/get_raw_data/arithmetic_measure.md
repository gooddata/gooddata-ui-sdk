---
title: Arithmetic Measure
sidebar_label: Arithmetic Measure
copyright: (C) 2007-2018 GoodData Corporation
id: arithmetic_measure
---

Arithmetic measures allow you to perform simple calculations with measures in a visualization.
A calculated **arithmetic measure** always references two measures, therefore the visualization must contain two measures at least.

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
To change the format, use the `format` attribute of the measure (see the [examples](#examples)).

## Arithmetic measure structure

To add an arithmetic measure to a visualization, use the `newArithmeticMeasure` factory function:

```javascript
newArithmeticMeasure(operands, operator, modifications)
```

An arithmetic measure can reference the following as its **operand**:
* Simple measures
* Derived measures (see [Time Over Time Comparison](../../add_interactivity/time_over_time/))
* Another arithmetic measures

You can specify operands either by their `localIdentifier` or by their value, and the factory function will extract
the local identifier for you.

The **operator** can be one of the following:
* `sum`
* `difference`
* `multiplication`
* `ratio`
* `change`

The **modifications** part is optional and is a function with a single parameter, which is an object with functions that you can use to override the measure's `format()` or `alias()`.

If arithmetic measures reference each other in an infinite loop or the referenced measure is not found in the visualization (there is no measure with the referenced *localIdentifier*), the error message is rendered instead of the visualization.

## Examples

### A difference between two measures - arithmetic measure constructed using localIdentifier references

````jsx harmony
import { newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const measures = [
    // the first simple measure (operand)
    newMeasure("boughtProductsIdentifier", m => m.alias("Bought products from supplier")),
    newMeasure("soldProductsLocalIdentifier", m => m.alias("Sold products to customers")),
    newArithmeticMeasure(
        ["boughtProductsLocalIdentifier", "soldProductsLocalIdentifier"],
        "difference",
        m => m.alias("Products remaining in warehouse")
    )
];

<PivotTable
    measures={measures}
/>
````

### Calculation with a derived measure (percentage change between two years)

The result of a `change` operation is returned as a percentage value in the default `#,##0.00%` format. This example
demonstrates passing measures by value to the different measure factory functions.

```jsx harmony
import { newMeasure, newPopMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const currentYear = newMeasure("measureIdentifier", m => m.alias("Current Year"));
// derived - data from previous year
const previousYear = newPopMeasure(currentYear, "attributeDisplayFormYearIdentifier", m => m.alias("Previous Year"));
// arithmetic measure with custom format
const change = newArithmeticMeasure(previousYear, currentYear, "change", m => m.alias("Change between years").format("$#,#0.0%"));

const measures = [
    currentYear,
    previousYear,
    change
];

<PivotTable
    measures={measures}
/>
```
