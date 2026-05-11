// (C) 2025-2026 GoodData Corporation

import { type ISortItem, sortDirection } from "@gooddata/sdk-model";

import { type AgGridColumnDef } from "../../types/agGrid.js";

import { getSortForColumnDefinition } from "./getSortForColumnDefinition.js";

/**
 * Applies provided sorts to col def.
 * If some sort item matches the col def, the sort is applied to the col def.
 *
 * @internal
 */
export const applySortByToColDef =
    (sortBy: ISortItem[]) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        if (sortBy.length === 0) {
            return colDef;
        }

        const sort = getSortForColumnDefinition(colDef.context.columnDefinition, sortBy);

        if (!sort) {
            return colDef;
        }

        return {
            ...colDef,
            initialSort: sortDirection(sort),
            initialSortIndex: sortBy.indexOf(sort),
        };
    };
