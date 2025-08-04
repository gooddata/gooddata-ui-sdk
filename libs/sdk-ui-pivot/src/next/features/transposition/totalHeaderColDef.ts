// (C) 2025 GoodData Corporation
import { ITableGrandTotalColumnDefinition, ITableSubtotalColumnDefinition } from "@gooddata/sdk-ui";
import { metricCellRenderer, extractFormattedValue } from "../columns/shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";

/**
 * Creates total header col def (for transposed table).
 *
 * @internal
 */
export function createTotalHeaderColDef(
    colId: string,
    columnDefinition: (ITableSubtotalColumnDefinition | ITableGrandTotalColumnDefinition) & {
        isTransposed: true;
    },
): AgGridColumnDef {
    const { totalHeader } = columnDefinition;
    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
        },
        headerName: totalHeader.totalHeaderItem.name,
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        cellRenderer: metricCellRenderer,
        sortable: false,
    };
}
