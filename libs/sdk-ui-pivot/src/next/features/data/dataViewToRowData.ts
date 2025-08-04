// (C) 2024-2025 GoodData Corporation
import { DataViewFacade, ITableDataValue } from "@gooddata/sdk-ui";
import { assertNever, DataValue } from "@gooddata/sdk-model";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { AgGridRowData } from "../../types/internal.js";
import { columnDefinitionToColId } from "../columns/colId.js";

/**
 * Creates ag-grid row data {@link AgGridRowData} from {@link DataViewFacade}.
 *
 * @internal
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
        const data: AgGridRowData = { cellDataByColId: {}, allRowData: [] };

        row.forEach((cell) => {
            const key = columnDefinitionToColId(cell.columnDefinition, columnHeadersPosition);
            data.cellDataByColId[key] = cell;
            const dataValue = extractDataValue(cell);
            data.allRowData.push(dataValue);
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

/**
 * Extracts {@link DataValue} from {@link ITableDataValue} if it exists, returns null otherwise.
 */
function extractDataValue(cell: ITableDataValue): DataValue | null {
    switch (cell.type) {
        case "value":
        case "subtotalValue":
        case "grandTotalValue":
        case "grandTotalSubtotalValue":
        case "overallTotalValue":
            return cell.value;
        case "attributeHeader":
        case "grandTotalHeader":
        case "measureHeader":
        case "totalHeader":
            return null;
        default:
            assertNever(cell);
            return null;
    }
}
