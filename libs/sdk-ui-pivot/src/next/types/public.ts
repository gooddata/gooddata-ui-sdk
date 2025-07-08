// (C) 2025 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttribute, IFilter, IMeasure, ISortItem, ITotal } from "@gooddata/sdk-model";

/**
 * Whether to display measures in columns or rows (transposed).
 *
 * This affects how execution and result of the table is constructed:
 * - "columns" - measures are included in the first dimension (top to bottom).
 * - "rows" - measures are included in the second dimension (left to right).
 *
 * @alpha
 */
export type MeasureGroupDimension = "columns" | "rows";

/**
 * @alpha
 */
export type ColumnHeadersPosition = "left" | "top";

/**
 * @alpha
 */
export type PivotTableNextConfig = {
    /**
     * Whether to preload all data first, or lazy load them on-demand.
     *
     * Default Value: false
     */
    preloadAllData?: boolean;

    /**
     * Whether to display measures in columns or rows (transposed).
     *
     * This affects how execution and result of the table is constructed:
     * - "columns" - measures are included in the first dimension (top to bottom).
     * - "rows" - measures are included in the second dimension (left to right).
     *
     * Default Value: "columns"
     */
    measureGroupDimension?: MeasureGroupDimension;

    /**
     * Whether to display column headers on the top or left.
     *
     * Default value: "left"
     */
    columnHeadersPosition?: ColumnHeadersPosition;
};

/**
 * @alpha
 */
export interface IPivotTableNextProps {
    /**
     * Backend to use for the pivot table.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to use for the pivot table.
     */
    workspace?: string;

    /**
     * Columns to display in the pivot table.
     */
    columns?: IAttribute[];

    /**
     * Rows to display in the pivot table.
     */
    rows?: IAttribute[];

    /**
     * Measures to display in the pivot table.
     */
    measures?: IMeasure[];

    /**
     * Filters to apply to the pivot table.
     */
    filters?: IFilter[];

    /**
     * Totals to display in the pivot table.
     */
    totals?: ITotal[];

    /**
     * Sort by to apply to the pivot table.
     */
    sortBy?: ISortItem[];

    /**
     * Configuration for the pivot table.
     */
    config?: PivotTableNextConfig;
}
