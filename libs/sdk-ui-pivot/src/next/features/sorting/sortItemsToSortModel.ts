// (C) 2025 GoodData Corporation

import { SortModelItem } from "ag-grid-enterprise";

import { ISortItem, sortDirection } from "@gooddata/sdk-model";

import { getSortForColumnDefinition } from "./getSortForColumnDefinition.js";
import { ColumnHeadersPosition } from "../../../publicTypes.js";
import { ITableColumnDefinitionByColId } from "../../types/internal.js";
import { columnDefinitionToColId } from "../columns/colId.js";

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
