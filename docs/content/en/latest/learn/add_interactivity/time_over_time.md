---
title: Time-over-Time Comparison
sidebar_label: Time-over-Time Comparison
copyright: (C) 2020 GoodData Corporation
id: time_over_time_comparison
---

Time-over-time comparison allows you to add a measure representing data from the past and compare it to another measure in a visualization. The visualization must contain at least one measure that the measure with the data from the past can reference.

The measure with the data from the past is called **derived measure**. The referenced measure is called **master measure**.

You can compare data to:
* The same period previous year
* The previous period

> We do not recommend that you create a derived measure from an [arithmetic measure](../../get_raw_data/arithmetic_measure/) that refers to another derived measure. The resulting derived measure may be hard to interpret.

## Comparing to the same period (SP) previous year

**Time shift**: -1 year

**Period**: 1 year

To add a SP derived measure to a visualization, use the following `newPopMeasure` factory function:

```javascript
newPopMeasure(masterMeasureOrLocalId, overPeriodAttributeId, modifications)
```

where:

-  `masterMeasureOrLocalId` is the measure with data to compare; specify either the measure's `localIdentifier` or the measure itself.
-  `overPeriodAttributeId` is the identifier of the date dimension year attribute to use for the shift.
-  `modifications` is a function that receives an object with functions to customize `format()` and `alias()`.


### Example

```jsx
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasure, newPopMeasure } from "@gooddata/sdk-model";

const masterMeasure = newMeasure("measureIdentifier", m => m.alias("Master Measure"));
const popMeasure = newPopMeasure(masterMeasure, "attributeYearIdentifier", m => m.alias("Same Period Previous Year"));

const measures = [
    masterMeasure,
    popMeasure
];

<PivotTable
    measures={measures}
/>
```

## Comparing to the previous period (PP)

**Time shift**: a specified number of periods

**Period**: defined by global [date filters](../../../references/filters/date_filter/) referenced by the date dataset URI or identifier in the derived measure definition

* For an **absolute** date filter, the period is N days.
* For a **relative** date filter, the period can be N days, weeks, months, quarters, or years depending on the selected granularity.

If no global date filter is defined, the derived measure returns the same data as the master measure.

To add a PP derived measure to a visualization, use the following `newPreviousPeriodMeasure` factory function:

```javascript
newPreviousPeriodMeasure(masterMeasureOrLocalId, dateDataSetsShift, modifications);
```

where:

-  `masterMeasureOrLocalId` is the measure with data to compare; specify either the measure's `localIdentifier` or the measure itself.
-  `dateDataSetsShift` is the definition of the period shift to apply; it is an object with the `dataSet` prop for the date dataset identifier and the `periodsAgo` prop to specify the period shift.
-  `modifications` is a fucntion that receives an object with functions to customize `format()` and `alias()`.

### Example

```jsx
import { newMeasure, newPreviousPeriodMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const filters = [
    newRelativeDateFilter("dateDatasetIdentifier", "GDC.time.date", -7, -1)
];

// master - last 7 days measure
const masterMeasure = newMeasure("measureIdentifier", m => m.alias("Master Measure"));
// derived - previous 7 days measure
const previousPeriod = newPreviousPeriodMeasure(
                            masterMeasure,
                            { dataSet: "dateDatasetIdentifier", periodsAgo: 1},
                            m => m.alias("Previous Period Measure")
                        );

const measures = [
    masterMeasure,
    previousPeriod
];

<PivotTable
    measures={measures}
    filters={filters}
/>
```
### Comparison to the PP and absolute date filters

Be careful when combining comparison to the PP with an **absolute** date filter.
For example, when filtering from March 1 to March 31, the previous period is the previous 31 days and **not** the previous month.
For comparing over a period other than a day, use a **relative** date filter with the required granularity (month, quarter).

## More examples

See the [live examples](https://gdui-examples.herokuapp.com/time-over-time-comparison).