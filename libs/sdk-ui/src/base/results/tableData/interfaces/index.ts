// (C) 2019-2025 GoodData Corporation

import { type ITableDataValue } from "./cells.js";
import { type ITableColumnDefinition } from "./columns.js";
import { type ITableRowDefinition } from "./rows.js";

/**
 * **The complete table data structure**.
 *
 * This is the main interface that represents a fully processed table data with all the metadata
 * needed to render pivot tables, flat tables, and transposed tables.
 *
 * It contains the structural definitions (rows/columns), the actual cell data, and flags
 * that describe the table layout and data interpretation.
 *
 * @alpha
 */
export type ITableData = {
    /**
     * Array of column definitions that describe the structure and meaning of each column.
     */
    columnDefinitions: ITableColumnDefinition[];
    /**
     * Array of row definitions that describe the structure and meaning of each row.
     */
    rowDefinitions: ITableRowDefinition[];
    /**
     * 2D array of table cell data where `data[rowIndex][columnIndex]` contains
     * the formatted and raw values for that specific table position.
     */
    data: ITableDataValue[][];
    /**
     * Whether the table uses pivoting (attributes in columns bucket).
     */
    isPivoted: boolean;
    /**
     * Whether measures are transposed from columns into rows.
     */
    isTransposed: boolean;
};
