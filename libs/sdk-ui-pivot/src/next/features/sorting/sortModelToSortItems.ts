// (C) 2025-2026 GoodData Corporation

import { type SortModelItem } from "ag-grid-enterprise";

import { type ISortItem } from "@gooddata/sdk-model";

import { type ITableColumnDefinitionByColId } from "../../types/internal.js";
import { createSortForColumnDefinition } from "./createSortForColumnDefinition.js";

/**
 * Converts ag-grid {@link SortModelItem}s to {@link ISortItem}s.
 *
 * @internal
 */
export function sortModelToSortItems(
    sortModel: SortModelItem[],
    columnDefinitionByColId: ITableColumnDefinitionByColId,
): ISortItem[] {
    return sortModel.flatMap((sort): ISortItem[] => {
        const columnDefinition = columnDefinitionByColId[sort.colId];
        const columnSort = columnDefinition
            ? createSortForColumnDefinition(columnDefinition, sort.sort)
            : undefined;

        if (columnSort) {
            return [columnSort];
        }

        return [];
    });
}
