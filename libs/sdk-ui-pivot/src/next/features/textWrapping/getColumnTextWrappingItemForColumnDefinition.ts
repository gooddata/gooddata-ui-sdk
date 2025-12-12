// (C) 2025 GoodData Corporation

import { type ITableColumnDefinition } from "@gooddata/sdk-ui";

import { createColumnTextWrappingItemForColumnDefinition } from "./createColumnTextWrappingItemForColumnDefinition.js";
import { isColumnTextWrappingItemMatch } from "./isColumnTextWrappingItemMatch.js";
import { type IColumnTextWrappingItem } from "../../types/textWrapping.js";

/**
 * Returns {@link IColumnTextWrappingItem} for the provided {@link ITableColumnDefinition} if match is found, undefined otherwise.
 *
 * @internal
 */
export function getColumnTextWrappingItemForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    columnTextWrapping: IColumnTextWrappingItem[],
): IColumnTextWrappingItem | undefined {
    // Settings are not compared for matching, we only need to find the item
    const columnTextWrappingItem = createColumnTextWrappingItemForColumnDefinition(columnDefinition, {});

    return columnTextWrapping?.find((c) => isColumnTextWrappingItemMatch(c, columnTextWrappingItem));
}
