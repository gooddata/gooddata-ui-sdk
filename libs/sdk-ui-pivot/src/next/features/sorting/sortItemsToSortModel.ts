// (C) 2025-2026 GoodData Corporation

import { type SortModelItem } from "ag-grid-enterprise";

import { type ISortItem, sortDirection } from "@gooddata/sdk-model";

import { type ColumnHeadersPosition } from "../../../publicTypes.js";
import { type ITableColumnDefinitionByColId } from "../../types/internal.js";
import { columnDefinitionToColId } from "../columns/colId.js";
import { getSortForColumnDefinition } from "./getSortForColumnDefinition.js";

/**
 * Converts ag-grid {@link SortModelItem}s to {@link ISortItem}s.
 *
 * @internal
 */
export function sortItemsToSortModel(
    sortItems: ISortItem[],
    columnDefinitionByColId: ITableColumnDefinitionByColId,
    columnHeadersPosition: ColumnHeadersPosition,
): SortModelItem[] {
    const sortModel: SortModelItem[] = [];

    Object.values(columnDefinitionByColId).forEach((columnDefinition) => {
        const sort = getSortForColumnDefinition(columnDefinition, sortItems);
        if (sort) {
            const sortIndex = sortItems.indexOf(sort);
            sortModel[sortIndex] = {
                colId: columnDefinitionToColId(columnDefinition, columnHeadersPosition),
                sort: sortDirection(sort),
            };
        }
    });

    return sortModel;
}
