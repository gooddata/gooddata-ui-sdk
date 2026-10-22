---
legacy_path: learn/add_interactivity/time_over_time
title: Compare a measure with a previous period
linkTitle: Time-over-time comparison
category: Data layer / Execution
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-model:newPopMeasure"
  - "@gooddata/sdk-model:newPreviousPeriodMeasure"
source_files:
  - src/execution/measure/factory.ts
props_interfaces:
  - IPreviousPeriodDateDataSetSimple[]
related_pages:
  - /docs/data-layer/data-model/measures
  - /docs/filters/date-filter
  - /docs/filters/filter-visual-components
  - /docs/visualisations/headline
  - /docs/data-layer/execution/execution-model
type: docs
description: Create same-period-last-year and previous-period derived measures with newPopMeasure and newPreviousPeriodMeasure.
weight: 85
section: Data layer
subsection: Execution
aliases:
  - "../../learn/add_interactivity/time_over_time/"
---

Use time-over-time comparison to add a measure with data from the past and compare it to another measure in a visualization. The visualization must contain at least one measure that the measure with the data from the past can reference.

The measure with the data from the past is called **derived measure**. The referenced measure is called **master measure**.

You can compare data to:
* The same period previous year
* The previous period

{{% alert color="warning" %}}
Avoid creating a derived measure from an arithmetic measure that refers to another derived measure. The result is hard to interpret.
{{% /alert %}}

## Compare to the same period (SP) previous year

**Time shift**: -1 year

**Period**: 1 year

To add a SP derived measure to a visualization, use the following `newPopMeasure` factory function:

```ts
newPopMeasure(masterMeasureOrLocalId, overPeriodAttributeId, modifications)
```

where:

-  `masterMeasureOrLocalId` is the measure with data to compare; specify either the measure's `localIdentifier` or the measure itself.
-  `overPeriodAttributeId` is the identifier (or `ObjRef`) of the date dimension year attribute to use for the shift.
-  `modifications` is an optional function that receives a builder with functions to customize `format()`, `alias()`, `title()`, and `localId()`.

### Example

```tsx
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasure, newPopMeasure } from "@gooddata/sdk-model";

const masterMeasure = newMeasure("measureIdentifier", (m) => m.alias("Master Measure"));
const popMeasure = newPopMeasure(masterMeasure, "attributeYearIdentifier", (m) => m.alias("Same Period Previous Year"));

const measures = [masterMeasure, popMeasure];

export const SamePeriodPreviousYear = () => <PivotTable measures={measures} />;
```

## Compare to the previous period (PP)

**Time shift**: a specified number of periods

**Period**: defined by the global [date filter](../../../filters/date-filter/) on the date dataset that the derived measure definition references by identifier or `ObjRef`

* For an **absolute** date filter, the period is N days.
* For a **relative** date filter, the period can be N days, weeks, months, quarters, or years depending on the selected granularity.

If no global date filter is defined, the derived measure returns the same data as the master measure.

To add a PP derived measure to a visualization, use the following `newPreviousPeriodMeasure` factory function:

```ts
newPreviousPeriodMeasure(masterMeasureOrLocalId, dateDataSets, modifications);
```

where:

-  `masterMeasureOrLocalId` is the measure with data to compare; specify either the measure's `localIdentifier` or the measure itself.
-  `dateDataSets` is an array of period shifts to apply (`IPreviousPeriodDateDataSetSimple[]`); each item is an object with the `dataSet` prop for the date dataset identifier (or `ObjRef`) and the `periodsAgo` prop to specify the period shift.
-  `modifications` is an optional function that receives a builder with functions to customize `format()`, `alias()`, `title()`, and `localId()`.

### Example

```tsx
import { newMeasure, newPreviousPeriodMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

const filters = [newRelativeDateFilter("dateDatasetIdentifier", "GDC.time.date", -7, -1)];

// master - last 7 days measure
const masterMeasure = newMeasure("measureIdentifier", (m) => m.alias("Master Measure"));
// derived - previous 7 days measure
const previousPeriod = newPreviousPeriodMeasure(
    masterMeasure,
    [{ dataSet: "dateDatasetIdentifier", periodsAgo: 1 }],
    (m) => m.alias("Previous Period Measure"),
);

const measures = [masterMeasure, previousPeriod];

export const PreviousPeriod = () => <PivotTable measures={measures} filters={filters} />;
```

### Comparison to the PP and absolute date filters

Be careful when combining comparison to the PP with an **absolute** date filter.
For example, when filtering from March 1 to March 31, the previous period is the previous 31 days and **not** the previous month.
For comparing over a period other than a day, use a **relative** date filter with the required granularity (month, quarter).

## More examples

See the [live examples](https://gdui-examples.herokuapp.com/time-over-time-comparison).
