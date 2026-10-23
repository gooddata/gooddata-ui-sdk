---
legacy_path: learn/get_raw_data/table_totals
title: Add totals to a table
category: Data layer / Execution
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-model:newTotal"
source_files:
  - src/execution/base/totals.ts
related_pages:
  - /docs/visualisations/pivot-table
  - /docs/data-layer/execution/result-structure
  - /docs/data-layer/execution/execution-model
  - /docs/data-layer/execution/custom-executions
description: Add grand totals and subtotals to Pivot Tables with newTotal, covering sum, avg, min, max, median, and rollup aggregations.
ai_generated_description: true
type: docs
weight: 84
section: Data layer
subsection: Execution
aliases:
  - "../../learn/get_raw_data/table_totals/"
---

Show rows with aggregated measure data in the `PivotTable` component with the `totals` prop. Create each total with `newTotal(type, measure, attribute, alias?)`, where `type` is one of the `TotalType` values below.

## Supported aggregation functions

| Function | `TotalType` | Description |
| :--- | :--- | :--- |
| Sum | `"sum"` | Sum of values |
| Maximum | `"max"` | Largest value |
| Minimum | `"min"` | Smallest value |
| Average | `"avg"` | Average value |
| Median | `"med"` | Middle value |
| Rollup | `"nat"` | Sum (or another type of aggregation) of pre-aggregated (raw) values |

## Add a column grand total

A column grand total aggregates data for all values in a column and displays it in the row pinned to the bottom of the table. Define it with a measure and the first row attribute.

Totals can't be calculated for tables without row attributes or without measures. A pivot table with column attributes shows totals for all columns with the specified measure.

{{< figure src="/gd-ui/pivot_table_totals.png" alt="Pivot table of franchise fees by state and month, with Sum and Avg grand total rows at the bottom" >}}

```tsx
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newTotal } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const measures = [Md.$FranchiseFees];
const columns = [Md.DateMonth.Short];
const rows = [Md.LocationCity];

const totals = [
    newTotal("sum", Md.$FranchiseFees, Md.LocationCity),
    newTotal("avg", Md.$FranchiseFees, Md.LocationCity),
];

export const TableWithGrandTotals = () => (
    <div style={{ height: 300 }}>
        <PivotTable measures={measures} columns={columns} rows={rows} totals={totals} />
    </div>
);
```

## Add a subtotal

A subtotal aggregates data for all values in an attribute group. It's displayed as a regular table row and isn't pinned to the bottom of the table.

Define a subtotal the same way as a grand total, but pass the attribute that is being grouped.

{{% alert color="info" %}}
Custom executions (`Execute`, `RawExecute`, `useExecutionDataView`) accept totals on any dimension. `PivotTable` renders totals defined on its row attributes as total rows and totals defined on its column attributes as total columns. Subtotals are rendered only when the table is sorted by the first row attribute, which is the default sorting for tables.
{{% /alert %}}

{{< figure src="/gd-ui/pivot_table_subtotals.png" alt="Pivot table of franchise fees by state and menu category, with a Sum subtotal row for each state and a Sum grand total row" >}}

```tsx
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newTotal } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const measures = [Md.$FranchiseFees];
const columns = [Md.DateMonth.Short];
const rows = [Md.LocationState, Md.MenuCategory];

const totals = [
    newTotal("sum", Md.$FranchiseFees, Md.LocationState),
    newTotal("sum", Md.$FranchiseFees, Md.MenuCategory),
];

export const TableWithSubtotals = () => (
    <div style={{ height: 300 }}>
        <PivotTable measures={measures} rows={rows} columns={columns} totals={totals} />
    </div>
);
```
