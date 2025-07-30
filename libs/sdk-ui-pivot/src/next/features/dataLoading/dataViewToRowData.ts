// (C) 2024-2025 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ColumnHeadersPosition } from "../../types/public.js";
import { AgGridRowData } from "../../types/internal.js";
import { columnDefinitionToColId } from "../columnDefs/columnDefinitionToColId.js";
/**
 * Map data view to ag-grid row data and pivot result fields.
 *
 * For standard data without pivoting, keys are metric or attribute local identifiers, and values are formatted values.
 * For pivoted data, keys are joined attribute label names, attribute values and metric local identifiers, and values are formatted metric values.
 *
 * @param dataView - Data view facade
 * @param columnHeadersPosition - Position of column headers ("top" or "left")
 */
export function dataViewToRowData(
    dataView: DataViewFacade,
    columnHeadersPosition: ColumnHeadersPosition,
): {
    rowData: AgGridRowData[];
    grandTotalRowData: AgGridRowData[];
} {
    const tableData = dataView.data().asTable();

    const rowData: AgGridRowData[] = [];
    const grandTotalRowData: AgGridRowData[] = [];

    tableData.data.forEach((row, rowIndex) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const data: AgGridRowData = { meta: {} as Record<string, ITableDataValue>, row: [] };

        row.forEach((cell) => {
            const key = columnDefinitionToColId(
                cell.columnDefinition,
                tableData.isTransposed,
                columnHeadersPosition,
            );
            data[key] = cell.formattedValue;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            data.meta[key] = cell;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            data.row.push(cell.value);
        });

        if (tableData.rowDefinitions[rowIndex].type === "grandTotal") {
            grandTotalRowData.push(data);
        } else {
            rowData.push(data);
        }
    });

    return {
        rowData,
        grandTotalRowData,
    };
}
