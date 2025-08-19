// (C) 2025 GoodData Corporation
import { SortModelItem } from "ag-grid-enterprise";

import { ISortItem } from "@gooddata/sdk-model";

import { createSortForColumnDefinition } from "./createSortForColumnDefinition.js";
import { ITableColumnDefinitionByColId } from "../../types/internal.js";

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
