// (C) 2025 GoodData Corporation

import { ITableColumnDefinition } from "@gooddata/sdk-ui";

import {
    createColumnWidthItemForColumnDefinition,
    createWeakColumnWidthItemForColumnDefinition,
} from "./createColumnWidthItemForColumnDefinition.js";
import { isColumnWidthItemMatch } from "./isColumnWidthItemMatch.js";
import { ColumnWidthItem } from "../../types/resizing.js";

/**
 * Returns {@link ColumnWidthItem} for the provided {@link ITableColumnDefinition} if match is found, undefined otherwise.
 *
 * @internal
 */
export function getColumnWidthItemForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    columnWidths: ColumnWidthItem[],
): ColumnWidthItem | undefined {
    // Width is not compared for matching, we only need to find the item
    const columnWidthItem = createColumnWidthItemForColumnDefinition(columnDefinition, 0);
    const columnWeakWidthItem = createWeakColumnWidthItemForColumnDefinition(columnDefinition, 0);

    return columnWidths?.find((c) => {
        const exactMatch = isColumnWidthItemMatch(c, columnWidthItem);
        const weakMatch = columnWeakWidthItem ? isColumnWidthItemMatch(c, columnWeakWidthItem) : false;
        return exactMatch || weakMatch;
    });
}
