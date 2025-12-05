---
title: Pivot Table (New)
sidebar_label: Pivot Table (New)
copyright: (C) 2025 GoodData Corporation
id: pivot_table_next_component
---

A **pivot table** expands capabilities of a regular (flat) table by allowing you to reorganize and summarize selected data beyond the typical row-column relationship.

**PivotTableNext** is the new implementation of the pivot table component, built on AG Grid Enterprise. It offers improved performance, better accessibility, and enhanced features compared to the original PivotTable component.

> **Note**: In the next major release, `PivotTableNext` will be renamed to `PivotTable`, and the legacy `PivotTable` component will be removed.

## Key Features

- **Better Performance**: Built on AG Grid Enterprise for superior rendering and scrolling performance
- **Text Wrapping**: Configurable text wrapping for better readability of long content
- **Cell Selection**: Support for selecting and copying cell content
- **Advanced Resizing**: More flexible column sizing options

## Structure

```jsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

<PivotTableNext
    measures={<measures>}
    rows={<rows>}
    columns={<columns>}
    …
/>
```

## AG Grid Enterprise License

PivotTableNext uses AG Grid Enterprise. While a license is optional, tables will display an AG Grid watermark without one. For production use, you can provide your license in one of two ways:

### Option 1: Using AgGridTokenProvider

Wrap your application with the `AgGridTokenProvider`:

```jsx
import { AgGridTokenProvider } from "@gooddata/sdk-ui-pivot/next";

<AgGridTokenProvider agGridToken="your-ag-grid-license-key">
    <YourApp />
</AgGridTokenProvider>;
```

### Option 2: Using the config prop

Pass the license directly to the component:

```jsx
<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    agGridToken="your-ag-grid-license-key"
/>
```

## Examples

### Basic pivot table

```jsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";
import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <PivotTableNext measures={[Md.$FranchiseFees]} rows={[Md.LocationState]} columns={[Md.DateMonth.Short]} />
</div>;
```

### Flat table

You can also use PivotTableNext to create a regular (flat) table:

```jsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";
import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <PivotTableNext measures={[Md.$FranchiseFees]} rows={[Md.LocationState]} />
</div>;
```

## Table Transposition

By default, measures are rendered in columns. To display measures in rows, use the `measureGroupDimension` config:

```jsx
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext } from "@gooddata/sdk-ui-pivot/next";
import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <PivotTableNext
        measures={[Md.$FranchiseFees]}
        rows={[Md.LocationState]}
        columns={[Md.DateDatasets.Date.MonthYear.Short]}
        config={{
            measureGroupDimension: "rows",
        }}
    />
</div>;
```

### Column Headers Position

For tables with measures in rows and no row attributes, you can position column headers on the left:

```jsx
<PivotTableNext
    measures={[Md.$FranchiseFees]}
    columns={[Md.LocationState]}
    config={{
        measureGroupDimension: "rows",
        columnHeadersPosition: "left",
    }}
/>
```

## Text Wrapping

PivotTableNext supports configurable text wrapping:

```jsx
<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    config={{
        textWrapping: {
            enabled: true,
            columnOverrides: [
                {
                    columnLocator: newAttributeColumnLocator(Md.LocationState),
                    wrapping: false,
                },
            ],
        },
    }}
/>
```

## Column Width Resizing

### Auto resizing

```jsx
const config = {
    columnSizing: {
        defaultWidth: "autoresizeAll",
    },
};

<PivotTableNext measures={[Md.$FranchiseFees]} rows={[Md.LocationState]} config={config} />;
```

### Manual resizing

```jsx
import {
    newWidthForAttributeColumn,
    setNewWidthForSelectedColumns,
    newAttributeColumnLocator,
} from "@gooddata/sdk-ui-pivot/next";

const config = {
    columnSizing: {
        columnWidths: [
            newWidthForAttributeColumn(Md.Date, 100),
            setNewWidthForSelectedColumns(
                Md.$FranchiseFees,
                [newAttributeColumnLocator(Md.DateMonth.Short, monthDateJanuaryUri)],
                200,
            ),
        ],
    },
};
```

## Sorting

Sorting works the same way as in the original PivotTable:

```jsx
import { newMeasureSort, newAttributeLocator } from "@gooddata/sdk-model";

const sortBy = [
    newMeasureSort(Md.$FranchiseFees, "desc", [
        newAttributeLocator(Md.DateMonth.Short, monthDateIdentifierJanuary),
    ]),
];

<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    columns={[Md.DateMonth.Short]}
    sortBy={sortBy}
/>;
```

## Totals

Display aggregated data using the `totals` prop or enable the menu for interactive totals:

```jsx
const config = {
    menu: {
        aggregations: true,
        aggregationsSubMenu: true,
    },
};

<PivotTableNext
    measures={[Md.$FranchiseFees]}
    rows={[Md.LocationState]}
    totals={[
        {
            type: "sum",
            attributeIdentifier: Md.LocationState.attribute.identifier,
        },
    ]}
    config={config}
/>;
```

## Configuration

```jsx
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
        enabled: true,
    },
};

<PivotTableNext measures={measures} rows={rows} columns={columns} sortBy={sortBy} config={config} />;
```

## Properties

| Name             | Required? | Type                 | Description                                                            |
| :--------------- | :-------- | :------------------- | :--------------------------------------------------------------------- |
| measures         | false     | IMeasure[]           | An array of measure definitions                                        |
| rows             | false     | IAttribute[]         | An array of attribute definitions that break measure data into rows    |
| columns          | false     | IAttribute[]         | An array of attribute definitions that break measure data into columns |
| totals           | false     | ITotal[]             | An array of total definitions                                          |
| filters          | false     | IFilter[]            | An array of filter definitions                                         |
| config           | false     | PivotTableNextConfig | The configuration object                                               |
| sortBy           | false     | ISortItem[]          | An array of sort definitions                                           |
| backend          | false     | IAnalyticalBackend   | The object with configuration for backend communication                |
| workspace        | false     | string               | The workspace ID                                                       |
| locale           | false     | string               | The localization of the table. Defaults to `en-US`                     |
| drillableItems   | false     | IDrillableItem[]     | An array of points and attribute values to be drillable                |
| ErrorComponent   | false     | Component            | A component to be rendered if in error state                           |
| LoadingComponent | false     | Component            | A component to be rendered if in loading state                         |
| onError          | false     | Function             | A callback when the component updates its error state                  |
| onExportReady    | false     | Function             | A callback when ready for exporting data                               |
| onLoadingChanged | false     | Function             | A callback when the loading state changes                              |
| onDrill          | false     | Function             | A callback when a drill is triggered                                   |
| onColumnResized  | false     | Function             | A callback when columns are manually resized                           |
| agGridToken      | false     | string               | AG Grid Enterprise license key                                         |
| pageSize         | false     | number               | Customize page size when fetching data. Default: 100                   |
| execConfig       | false     | IExecutionConfig     | Execution configuration for the table                                  |

## Migration from PivotTable

When migrating from the original `PivotTable` to `PivotTableNext`:

1. **Update imports**: Change from `@gooddata/sdk-ui-pivot` to `@gooddata/sdk-ui-pivot/next`
2. **CSS**: Continue using `main.css` - it includes styles for both components
3. **Add AG Grid license** (optional): Provide `agGridToken` via context or prop to remove watermark
4. **Review configuration**: Config options are backwards compatible but have been extended
5. **Test thoroughly**: While APIs are similar, there may be subtle behavioral differences

## Differences from Original PivotTable

- Built on AG Grid Enterprise (requires license to get rid of watermark)
- Improved performance for large datasets
- Better accessibility support
- Enhanced text wrapping capabilities
- Different CSS class names and styling approach
- Some internal implementation details differ

For full API documentation, see the [TypeScript definitions](../../API_references.md).
