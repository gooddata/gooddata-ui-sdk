// (C) 2019-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import {
    IAttributeDescriptor,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
} from "@gooddata/sdk-model";

import { ITableDataHeaderScope } from "./scope.js";

/**
 * Represents all possible column types in a pivot table structure.
 *
 * Think of a pivot table as having these column types from left to right:
 * 1. **Attribute columns** - Show row grouping labels (like "Country", "City")
 * 2. **Measure header column** - Shows measure names (only when measures are in rows)
 * 3. **Value/Total columns** - Show actual numbers and totals
 *
 * The exact combination depends on your data setup:
 *
 * **When measures are in columns (normal pivot table):**
 * ```
 * |         |        | Brand > Product     |                |                |
 * |         |        |---------------------|----------------|----------------|
 * |         |        | GoodData            |                | ColMin Σ       |
 * |         |        |---------------------|----------------|                |
 * |         |        | Panther  | Bear     | Sum A          |                |
 * |---------|--------|---------------------|----------------|----------------|
 * | Country | City   | Sales    | Sales    | Sales          | Sales          |
 * |---------|--------|----------|----------|----------------|----------------|
 * | USA     | NYC    | 100      | 150      | 250            | 100            |
 * | USA     | LA     | 200      | 250      | 450            | 200            |
 * ```
 * - Country, City are {@link ITableAttributeColumnDefinition}
 * - Sales is {@link ITableValueColumnDefinition}
 * - Sum A is {@link ITableSubtotalColumnDefinition}
 * - ColSum Σ is {@link ITableGrandTotalColumnDefinition}
 *
 * **When measures are in rows (transposed + non-pivoted):**
 * ```
 * | Country | City | MeasureGroupHeader  | MeasureGroupValue     |
 * |---------|------|---------------------|-----------------------|
 * | USA     | NYC  | Sales               | 100                   |
 * | USA     | NYC  | Profit              | 20                    |
 * ```
 * - Country, City are {@link ITableAttributeColumnDefinition}
 * - MeasureGroupHeader is {@link ITableMeasureGroupHeaderColumnDefinition}
 * - MeasureGroupValue is {@link ITableMeasureGroupValueColumnDefinition}
 *
 * **When measures are in rows (transposed + pivoted):**
 * ```
 * |                                        | Quarter        |                |
 * |----------------------------------------|----------------|                |
 * | Country | City | MeasureGroupHeader    | Q1             | ColSum Σ       |
 * |---------|------|-----------------------|----------------|----------------|
 * | USA     | NYC  | Sales                 | 250            | 500            |
 * | USA     | NYC  | Profit                | 450            | 900            |
 * ```
 * - Country, City are {@link ITableAttributeColumnDefinition}
 * - MeasureGroupHeader is {@link ITableMeasureGroupHeaderColumnDefinition}
 * - Q1 is {@link ITableValueColumnDefinition}
 * - ColSum Σ is {@link ITableGrandTotalColumnDefinition}
 *
 * @alpha
 */
export type ITableColumnDefinition =
    | ITableAttributeColumnDefinition
    | ITableValueColumnDefinition
    | ITableMeasureGroupHeaderColumnDefinition
    | ITableMeasureGroupValueColumnDefinition
    | ITableSubtotalColumnDefinition
    | ITableGrandTotalColumnDefinition;

/**
 * Defines a column that shows row attribute values (like "Country" or "City").
 *
 * **What it does:**
 * These are the leftmost columns that show your row groupings. If you have
 * "Country" and "City" in your rows bucket, you'll get two attribute columns.
 *
 * **When it's created:**
 * - Automatically created for each attribute in the rows bucket
 * - Always appears first (leftmost) in the table
 * - Created regardless of whether you have measures in rows or columns
 *
 * **Real example:**
 * ```
 * | Country | City | Sales |  <- "Country" and "City" are attribute columns
 * |---------|------|-------|
 * | USA     | NYC  | 100   |
 * | USA     | LA   | 200   |
 * ```
 *
 * @alpha
 */
export interface ITableAttributeColumnDefinition {
    /**
     * Always "attribute" - identifies this as an attribute column.
     */
    type: "attribute";

    /**
     * Position of this column in the final table (0-based).
     */
    columnIndex: number;

    /**
     * Which attribute from the rows bucket this column represents (0-based).
     */
    rowHeaderIndex: number;

    /**
     * Metadata about this attribute (name, data type, formatting, etc.).
     * Contains information like the attribute's display name, local identifier, etc.
     */
    attributeDescriptor: IAttributeDescriptor;
}

/**
 * Defines columns that contain actual data values (values and subtotals).
 *
 * **What it does:**
 * These columns show your actual data - sales numbers, counts, percentages, etc.
 * The `columnScope` tells you exactly what this column represents.
 *
 * **When it's created:**
 * The system creates these based on your column headers. Here's how:
 *
 * **Simple case - just measures:**
 * ```
 * | Country | Sales | Profit |  <- Sales and Profit are value columns
 * |---------|-------|--------|
 * | USA     | 100   | 20     |
 * ```
 *
 * **Pivoted case - attributes + measures in columns:**
 * ```
 * | Country | East Sales | East Profit | West Sales | West Profit |
 * |---------|------------|-------------|------------|-------------|
 * | USA     | 100        | 20          | 150        | 30          |
 * ```
 *
 * **Transposed case - measures in rows, attributes in columns:**
 * ```
 * | Country | Measure | East | West |
 * |---------|---------|------|------|
 * | USA     | Sales   | 100  | 150  |
 * | USA     | Profit  | 20   | 30   |
 * ```
 *
 * @alpha
 */
export type ITableValueColumnDefinition = {
    /**
     * Always "value" - identifies this as a value column.
     */
    type: "value";

    /**
     * Position of this column in the final table (0-based).
     * Comes after all row attribute columns.
     */
    columnIndex: number;

    /**
     * Position in the original column headers array.
     */
    columnHeaderIndex: number;

    /**
     * Describes exactly what this column represents.
     * For value, its always only regular attribute / measure scopes.
     */
    columnScope: ITableDataHeaderScope[];
} & (
    | /**
     * Handles case, when pivoting and measures are in rows.
     */
    {
          isEmpty: false;
          isTransposed: true;
          attributeHeader: IResultAttributeHeader;
          attributeDescriptor: IAttributeDescriptor;
      }
    /**
     * Handles standard pivoting case without transposition.
     */
    | {
          isEmpty: false;
          isTransposed: false;
          measureHeader: IResultMeasureHeader;
          measureDescriptor: IMeasureDescriptor;
      }
    /**
     * Handles case, when pivoting, but there are no measures.
     */
    | {
          isEmpty: true;
          isTransposed: false;
          attributeHeader: IResultAttributeHeader;
          attributeDescriptor: IAttributeDescriptor;
      }
);

/**
 * Defines columns that show subtotal values.
 *
 * **What it does:**
 * Shows subtotals - these are columns that show the aggregation of values for a specific attribute pivoting subgroup.
 *
 * **When it's created:**
 * - Only when you have at least 2 attributes in the columns bucket (pivoting).
 * - Only when you set total for pivoting subgroup (not the leftmost column attribute - then it's grand total).
 * - In the example, total is set for Product x Sales.
 *
 * **Real example:**
 * ```
 * |         |        | Brand > Product     |                |
 * |         |        |---------------------|----------------|
 * |         |        | GoodData            |                |
 * |         |        |---------------------|----------------|
 * |         |        | Panther  | Bear     | Sum A          |
 * |---------|--------|---------------------|----------------|
 * | Country | City   | Sales    | Sales    | Sales          |
 * |---------|--------|----------|----------|----------------|
 * | USA     | NYC    | 100      | 150      | 250            |
 * | USA     | LA     | 200      | 250      | 450            |
 * ```
 *
 * @alpha
 */
export type ITableSubtotalColumnDefinition = {
    /**
     * Always "subtotal" - identifies this as a subtotal column.
     */
    type: "subtotal";

    /**
     * Position of this column in the final table (0-based).
     * Usually appears after regular value columns for each pivot subgroup.
     */
    columnIndex: number;

    /**
     * Position in the original headers array.
     */
    columnHeaderIndex: number;

    /**
     * Describes exactly what this column represents.
     * For subtotal, its always mix of regular attribute / measure scopes and total scopes.
     */
    columnScope: ITableDataHeaderScope[];
} & (
    | /**
     * Handles case, when pivoting and measures are in rows.
     */ {
          isEmpty: false;
          isTransposed: true;
          totalHeader: IResultTotalHeader;
          attributeDescriptor: IAttributeDescriptor;
      }
    /**
     * Handles standard pivoting case without transposition.
     */
    | {
          isEmpty: false;
          isTransposed: false;
          totalHeader: IResultTotalHeader;
          measureDescriptor: IMeasureDescriptor;
      }
);

/**
 * Defines columns that show grand total values.
 *
 * **What it does:**
 * Shows grand totals - these are columns that show the aggregation of values for the top level pivoting attribute,
 * always appears as the rightmost columns.
 *
 * **When it's created:**
 * - Only when you have at least 1 attribute in the columns bucket (pivoting).
 * - Only when you set total for the leftmost column attribute.
 * - In the example, total is set for Brand x Sales.
 *
 * **Real example:**
 * ```
 * |         |        | Brand > Product     |                |
 * |         |        |---------------------|----------------|
 * |         |        | GoodData            | ColMin Σ       |
 * |         |        |---------------------|                |
 * |         |        | Panther  | Bear     |                |
 * |---------|--------|---------------------|----------------|
 * | Country | City   | Sales    | Sales    | Sales          |
 * |---------|--------|----------|----------|----------------|
 * | USA     | NYC    | 100      | 150      | 100            |
 * | USA     | LA     | 200      | 250      | 200            |
 * ```
 *
 * @alpha
 */
export type ITableGrandTotalColumnDefinition = {
    /**
     * Always "grandTotal" - identifies this as a grand total column.
     */
    type: "grandTotal";

    /**
     * Position of this column in the final table (0-based).
     * Usually the rightmost column in the table.
     */
    columnIndex: number;

    /**
     * Position in the original column headers array.
     */
    columnHeaderIndex: number;

    /**
     * Describes exactly what this column represents.
     */
    columnScope: ITableDataHeaderScope[];
} & (
    | /**
     * Handles case, when pivoting and measures are in rows.
     */ {
          isEmpty: false;
          isTransposed: true;
          totalHeader: IResultTotalHeader;
          attributeDescriptor: IAttributeDescriptor;
      }
    | /**
     * Handles standard pivoting case without transposition.
     */ {
          isEmpty: false;
          isTransposed: false;
          totalHeader: IResultTotalHeader;
          measureDescriptor: IMeasureDescriptor;
      }
);

/**
 * Defines the column that shows measure names when measures are in rows.
 *
 * **What it does:**
 * When you put measures in rows instead of columns, you need a column to show
 * which measure each row represents ("Sales", "Profit", etc.).
 *
 * **When it's created:**
 * - Only when `measureDimension === "rows"` (measures are transposed)
 * - Always created when you have measures in rows
 * - Appears right after your attribute columns
 *
 * **Real example:**
 * ```
 * | Country | City | Measure | Q1  | Q2  |  <- "Measure" column shows measure names
 * |---------|------|---------|-----|-----|
 * | USA     | NYC  | Sales   | 100 | 150 |
 * | USA     | NYC  | Profit  | 20  | 30  |
 * | USA     | LA   | Sales   | 200 | 250 |
 * | USA     | LA   | Profit  | 40  | 50  |
 * ```
 *
 * @alpha
 */
export interface ITableMeasureGroupHeaderColumnDefinition {
    /**
     * Always "measureGroupHeader" - identifies this as a measure names column.
     */
    type: "measureGroupHeader";

    /**
     * Position of this column in the final table (0-based).
     * Always appears right after attribute columns, before value columns.
     */
    columnIndex: number;

    /**
     * Metadata about the group of measures being displayed.
     * Contains information about all measures that will appear in rows.
     */
    measureGroupDescriptor: IMeasureGroupDescriptor;

    /**
     * Descriptors for attributes that are in the columns bucket.
     */
    attributeDescriptors: IAttributeDescriptor[];
}

/**
 * Defines the single value column when measures are in rows and there are no column attributes.
 *
 * **What it does:**
 * When measures are in rows and you don't have any attributes in columns,
 * you get one simple "Values" column that shows all the numbers.
 *
 * **When it's created:**
 * - Only when measures are in rows and there are no pivoting columns.
 * - Appears as the rightmost column after the measure header column
 *
 * **Real example:**
 * ```
 * | Country | City | Measure | Value |  <- "Value" is the measure group value column
 * |---------|------|---------|-------|
 * | USA     | NYC  | Sales   | 100   |
 * | USA     | NYC  | Profit  | 20    |
 * | USA     | LA   | Sales   | 200   |
 * | USA     | LA   | Profit  | 40    |
 * ```
 *
 * **What happens if you DO have column attributes:**
 * If you have attributes in columns (like "Q1", "Q2"), then instead of this single
 * column, you get multiple `ITableValueColumnDefinition` columns - one for each
 * column attribute combination.
 *
 * @alpha
 */
export interface ITableMeasureGroupValueColumnDefinition {
    /**
     * Always "measureGroupValue" - identifies this as the single values column
     * when measures are in rows and there are no column attributes.
     */
    type: "measureGroupValue";

    /**
     * Position of this column in the final table (0-based).
     * Always the rightmost column when this type is used.
     */
    columnIndex: number;

    /**
     * Metadata about the group of measures whose values are shown.
     */
    measureGroupDescriptor: IMeasureGroupDescriptor;
}

/**
 * Type guard to check if a column definition is an attribute column
 * @alpha
 */
export function isAttributeColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableAttributeColumnDefinition {
    return (
        !isEmpty(columnDefinition) &&
        (columnDefinition as ITableAttributeColumnDefinition).type === "attribute"
    );
}

/**
 * Type guard to check if a column definition is a value column
 * @alpha
 */
export function isValueColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableValueColumnDefinition {
    return !isEmpty(columnDefinition) && (columnDefinition as ITableValueColumnDefinition).type === "value";
}

/**
 * Type guard to check if a column definition is a measure group header column
 * @alpha
 */
export function isMeasureGroupHeaderColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableMeasureGroupHeaderColumnDefinition {
    return (
        !isEmpty(columnDefinition) &&
        (columnDefinition as ITableMeasureGroupHeaderColumnDefinition).type === "measureGroupHeader"
    );
}

/**
 * Type guard to check if a column definition is a measure group value column
 * @alpha
 */
export function isMeasureGroupValueColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableMeasureGroupValueColumnDefinition {
    return (
        !isEmpty(columnDefinition) &&
        (columnDefinition as ITableMeasureGroupValueColumnDefinition).type === "measureGroupValue"
    );
}

/**
 * Type guard to check if a column definition is a subtotal column
 * @alpha
 */
export function isSubtotalColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableSubtotalColumnDefinition {
    return (
        !isEmpty(columnDefinition) && (columnDefinition as ITableSubtotalColumnDefinition).type === "subtotal"
    );
}

/**
 * Type guard to check if a column definition is a grand total column
 * @alpha
 */
export function isGrandTotalColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableGrandTotalColumnDefinition {
    return (
        !isEmpty(columnDefinition) &&
        (columnDefinition as ITableGrandTotalColumnDefinition).type === "grandTotal"
    );
}

/**
 * Type guard to check if a value column definition is a transposed case (measures in rows)
 * @alpha
 */
export function isTransposedValueColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableValueColumnDefinition & {
    isEmpty: false;
    isTransposed: true;
    attributeHeader: IResultAttributeHeader;
    attributeDescriptor: IAttributeDescriptor;
} {
    return (
        isValueColumnDefinition(columnDefinition) &&
        !columnDefinition.isEmpty &&
        columnDefinition.isTransposed === true &&
        "attributeHeader" in columnDefinition &&
        "attributeDescriptor" in columnDefinition
    );
}

/**
 * Type guard to check if a value column definition is a standard pivoting case
 * @alpha
 */
export function isStandardValueColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableValueColumnDefinition & {
    isEmpty: false;
    isTransposed: false;
    measureHeader: IResultMeasureHeader;
    measureDescriptor: IMeasureDescriptor;
} {
    return (
        isValueColumnDefinition(columnDefinition) &&
        !columnDefinition.isEmpty &&
        columnDefinition.isTransposed === false &&
        "measureHeader" in columnDefinition &&
        "measureDescriptor" in columnDefinition
    );
}

/**
 * Type guard to check if a value column definition is an empty pivoting case
 * @alpha
 */
export function isEmptyValueColumnDefinition(
    columnDefinition: unknown,
): columnDefinition is ITableValueColumnDefinition & {
    isEmpty: true;
    isTransposed: false;
    attributeHeader: IResultAttributeHeader;
    attributeDescriptor: IAttributeDescriptor;
} {
    return (
        isValueColumnDefinition(columnDefinition) &&
        columnDefinition.isEmpty === true &&
        columnDefinition.isTransposed === false &&
        "attributeHeader" in columnDefinition &&
        "attributeDescriptor" in columnDefinition
    );
}
