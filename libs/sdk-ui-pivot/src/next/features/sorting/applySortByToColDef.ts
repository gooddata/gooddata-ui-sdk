// (C) 2025 GoodData Corporation
import { ISortItem, sortDirection } from "@gooddata/sdk-model";
import { AgGridColumnDef } from "../../types/agGrid.js";
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
            sort: sortDirection(sort),
        };
    };
