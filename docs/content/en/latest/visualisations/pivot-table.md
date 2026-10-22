---
legacy_path: references/visual_components/pivot_table
title: Pivot table
description: Display data in a flexible, multi-dimensional table with the PivotTableNext component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-pivot:PivotTableNext"
  - "@gooddata/sdk-ui-pivot:IPivotTableNextProps"
source_files:
  - src/next/PivotTableNext.tsx
  - src/next/types/public.ts
props_interfaces:
  - IPivotTableNextProps
  - IVisualizationProps
  - IVisualizationCallbacks
related_pages:
  - /docs/data-layer/execution/table-totals
  - /docs/data-layer/execution/result-structure
  - /docs/visualisations/repeater
  - /docs/visualisations/heatmap
  - /docs/visualisations/charts-and-plots
type: docs
weight: 22
section: Visualisations
aliases:
  - "../references/visual_components/pivot_table/"
  - "../references/visual_components/pivot_table_next/"
---

A **pivot table** expands a regular (flat) table: you can reorganize and summarize the data beyond the usual row-column relationship.

This page documents `PivotTableNext`, the pivot table component built on AG Grid Enterprise. It replaces the original `PivotTable` component.

{{% alert color="warning" title="Note" %}}
In the next major version, `PivotTableNext` replaces the legacy `PivotTable` component, and the `Next` suffixes are dropped from the component and type names.
{{% /alert %}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | No | One or more measures | Adds one column of values per measure. To show the measures in rows instead, see [Table transposition](#table-transposition). |
| `rows` | No | One or more attributes | Adds one row per attribute value combination. |
| `columns` | No | One or more attributes | Splits the measure columns by the attribute values. |
| `totals` | No | Totals | Adds aggregated rows. See [Totals](#totals). |
| `filters` | No | Filters | Limits the data the table shows. |

## Sorting

To sort the table, pass sort items in the `sortBy` prop. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

```tsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";
import { newAttributeLocator, newMeasureSort } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const sortBy = [
    newMeasureSort(Md.$FranchiseFees, "desc", [
        newAttributeLocator(Md.DateMonth.Short, "<january-element-value>"),
    ]),
];

<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    columns={[Md.DateMonth.Short]}
    sortBy={sortBy}
/>;
```

The second argument of `newAttributeLocator` is the attribute element: on GoodData Cloud and GoodData.CN, its value (primary key).

## Configuration

Pass these options in the `config` prop:

```tsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext, newWidthForAttributeColumn } from "@gooddata/sdk-ui-pivot/next";
import * as Md from "./catalog.js";

const config = {
    maxHeight: 800,
    menu: {
        aggregations: true,
        aggregationsSubMenu: true,
    },
    separators: {
        thousand: ",",
        decimal: ".",
    },
    columnSizing: {
        defaultWidth: "autoresizeAll",
        columnWidths: [newWidthForAttributeColumn(Md.Date, 100)],
    },
    textWrapping: {
        wrapText: true,
    },
};

<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    columns={[Md.DateMonth.Short]}
    config={config}
/>;
```

Cell selection lets you select and copy cell content. It is on by default; set `config.enableCellSelection` to `false` to turn it off.

### AG Grid Enterprise license

`PivotTableNext` uses AG Grid Enterprise. A license is optional, but without one the table shows an AG Grid watermark. For production, provide your license in one of two ways:

- Wrap your application in `AgGridTokenProvider` and pass the license in its `token` prop:

    ```tsx
    import { AgGridTokenProvider } from "@gooddata/sdk-ui-pivot/next";

    <AgGridTokenProvider token="<ag-grid-license-key>">
        <YourApp />
    </AgGridTokenProvider>;
    ```

- Pass the license in the component's `config.agGridToken`:

    ```tsx
    <PivotTableNext
        measures={[Md.$FranchiseFees]}
        rows={[Md.LocationState]}
        config={{ agGridToken: "<ag-grid-license-key>" }}
    />
    ```

### Table transposition

By default, measures are rendered in columns. To display measures in rows, set `config.measureGroupDimension` to `"rows"`:

```tsx
<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    columns={[Md.DateDatasets.Date.MonthYear.Short]}
    config={{
        measureGroupDimension: "rows",
    }}
/>
```

When the table has measures in rows and no row attributes, `config.columnHeadersPosition: "left"` places the column headers on the left:

```tsx
<PivotTableNext
    measures={[Md.$FranchiseFees]}
    columns={[Md.LocationState]}
    config={{
        measureGroupDimension: "rows",
        columnHeadersPosition: "left",
    }}
/>
```

### Text wrapping

`wrapText` and `wrapHeaderText` apply to all columns. `columnOverrides` changes the setting for the columns matched by its `locators`:

```tsx
import { PivotTableNext, newAttributeColumnLocator } from "@gooddata/sdk-ui-pivot/next";

<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    config={{
        textWrapping: {
            wrapText: true,
            wrapHeaderText: true,
            columnOverrides: [
                {
                    locators: [newAttributeColumnLocator(Md.LocationState)],
                    wrapText: false,
                },
            ],
        },
    }}
/>
```

### Column width

To size every column to its content, set `config.columnSizing.defaultWidth` to `"autoresizeAll"`:

```tsx
<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    config={{ columnSizing: { defaultWidth: "autoresizeAll" } }}
/>
```

To set the width of specific columns, list them in `config.columnSizing.columnWidths`. The attribute element in `newAttributeColumnLocator` is the element value (primary key):

```tsx
import {
    newAttributeColumnLocator,
    newWidthForAttributeColumn,
    setNewWidthForSelectedColumns,
} from "@gooddata/sdk-ui-pivot/next";

const config = {
    columnSizing: {
        columnWidths: [
            newWidthForAttributeColumn(Md.Date, 100),
            setNewWidthForSelectedColumns(
                Md.$FranchiseFees,
                [newAttributeColumnLocator(Md.DateMonth.Short, "<january-element-value>")],
                200,
            ),
        ],
    },
};
```

## Totals

Pass totals in the `totals` prop, or enable the column menu so that users add totals themselves. Build each total with `newTotal` from `@gooddata/sdk-model`; it takes the aggregation type, the measure, and the attribute to aggregate by:

```tsx
import { newTotal } from "@gooddata/sdk-model";

<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    totals={[newTotal("sum", Md.$FranchiseFees, Md.LocationState)]}
    config={{
        menu: {
            aggregations: true,
            aggregationsSubMenu: true,
        },
    }}
/>
```

See [Table totals](../../data-layer/execution/table-totals/) for the total types.

## Migrate from PivotTable

To move from the original `PivotTable` to `PivotTableNext`:

1. Import `PivotTableNext` instead of `PivotTable`. The component is exported from both `@gooddata/sdk-ui-pivot` and the `@gooddata/sdk-ui-pivot/next` entry point. `AgGridTokenProvider` comes from `@gooddata/sdk-ui-pivot/next`.
2. Keep importing `main.css`. It includes the styles for both components.
3. Optionally, provide an AG Grid license through `AgGridTokenProvider` or `config.agGridToken` to remove the watermark.
4. Review your configuration. The options are backward compatible and extended.
5. Test the table. `PivotTableNext` uses different CSS class names, and some behavior can differ in details.

## Structure

```tsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

<PivotTableNext
    measures={<measures>}
    rows={<rows>}
    columns={<columns>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <PivotTableNext measures={[Md.$FranchiseFees]} rows={[Md.LocationState]} columns={[Md.DateMonth.Short]} />
</div>;
```

Leave out `columns` to render a regular (flat) table:

```tsx
<div style={style}>
    <PivotTableNext measures={[Md.$FranchiseFees]} rows={[Md.LocationState]} />
</div>
```

## Props

{{% props %}}
