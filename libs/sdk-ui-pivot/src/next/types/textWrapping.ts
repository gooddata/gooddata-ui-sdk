// (C) 2025 GoodData Corporation

import { type ColumnLocator } from "./locators.js";

/**
 * Column text wrapping item that specifies text wrapping settings for specific column(s).
 *
 * @public
 */
export interface IColumnTextWrappingItem {
    /**
     * Column locators to identify which column this wrapping applies to.
     */
    locators: ColumnLocator[];

    /**
     * Whether to wrap text in cells for the specified columns.
     */
    wrapText?: boolean;

    /**
     * Whether to wrap text in column headers for the specified columns.
     */
    wrapHeaderText?: boolean;

    /**
     * Match type determines how the locators are matched against columns.
     *
     * - "column" (default): Exact match - all locators must match exactly
     * - "pivotGroup": Pivot group match - locators match the pivot group and all its descendant columns
     *
     * @remarks
     * Use "pivotGroup" for pivot group headers to match all descendant columns.
     * Use "column" (or omit) for specific column overrides.
     */
    matchType?: "column" | "pivotGroup";
}

/**
 * @public
 */
export interface ITextWrapping {
    /**
     * Whether to wrap text in cells (global for all columns).
     */
    wrapText?: boolean;

    /**
     * Whether to wrap text in column headers (global for all columns).
     */
    wrapHeaderText?: boolean;

    /**
     * Per-column text wrapping overrides that take precedence over the global settings.
     *
     * @remarks
     * Each item specifies text wrapping for one or more columns identified by locators.
     * This allows different columns to have different text wrapping settings.
     */
    columnOverrides?: IColumnTextWrappingItem[];
}

/**
 * @public
 */
export type PivotTableNextTextWrappingConfig = {
    /**
     * Configure text wrapping.
     */
    textWrapping?: ITextWrapping;
};
