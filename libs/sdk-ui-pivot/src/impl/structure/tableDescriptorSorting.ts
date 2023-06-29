// (C) 2007-2021 GoodData Corporation
import { SortDirection } from "@gooddata/sdk-model";
import { ColDef, Column } from "@ag-grid-community/all-modules";
import { isColumn } from "../base/agUtils.js";

/**
 * This interface pin-points the sort-specific props in ag-grid ColDef.
 */
export type SortIndicator = {
    colId: string;
    sort: SortDirection;
};

function sortIndicatorsFromColDefs(colDefs: Array<ColDef>): SortIndicator[] {
    return colDefs
        .filter((col) => col.sort !== undefined && col.sort !== null)
        .map((col) => ({
            colId: col.colId!,
            sort: col.sort as SortDirection,
        }));
}

function sortIndicatorsFromColumns(columns: Array<Column>): SortIndicator[] {
    return columns
        .filter((col) => col.getSort() !== undefined && col.getSort() !== null)
        .map((col) => ({
            colId: col.getColId(),
            sort: col.getSort() as SortDirection,
        }));
}

export function createSortIndicators(columns: Array<Column> | Array<ColDef>): SortIndicator[] {
    if (isColumn(columns[0])) {
        return sortIndicatorsFromColumns(columns as Array<Column>);
    }

    return sortIndicatorsFromColDefs(columns as Array<ColDef>);
}
