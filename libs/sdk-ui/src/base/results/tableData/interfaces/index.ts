// (C) 2019-2025 GoodData Corporation

import { ITableDataValue } from "./cells.js";
import { ITableColumnDefinition } from "./columns.js";
import { ITableRowDefinition } from "./rows.js";

/**
 * @alpha
 */
export type ITableData = {
    columnDefinitions: ITableColumnDefinition[];
    rowDefinitions: ITableRowDefinition[];
    data: ITableDataValue[][];
    isPivoted: boolean;
    isTransposed: boolean;
};
