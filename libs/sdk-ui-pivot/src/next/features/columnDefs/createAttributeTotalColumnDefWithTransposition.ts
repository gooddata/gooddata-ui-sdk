// (C) 2025 GoodData Corporation
import { IResultTotalHeader } from "@gooddata/sdk-model";
import { ITableColumnDefinition } from "@gooddata/sdk-ui";
import { metricCellRenderer } from "./shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";

/**
 * @internal
 */
export function createAttributeTotalColumnDefWithTransposition(
    colId: string,
    columnDefinition: ITableColumnDefinition,
    totalHeader: IResultTotalHeader,
): AgGridColumnDef {
    return {
        colId,
        field: colId,
        context: {
            columnDefinition,
        },
        headerName: totalHeader.totalHeaderItem.name,
        valueGetter: (params) => {
            return params.data?.[colId];
        },
        cellRenderer: metricCellRenderer,
    };
}
