// (C) 2024-2025 GoodData Corporation

import { DataValue, ISeparators, assertNever } from "@gooddata/sdk-model";
import { DataViewFacade, ITableDataValue, createNumberJsFormatter } from "@gooddata/sdk-ui";

import { GrandTotalsPosition } from "../../types/grandTotalsPosition.js";
import { AgGridRowData } from "../../types/internal.js";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { columnDefinitionToColId } from "../columns/colId.js";

/**
 * Creates ag-grid row data {@link AgGridRowData} from {@link DataViewFacade}.
 *
 * @param dataView - The data view facade containing the table data
 * @param columnHeadersPosition - Position of column headers (top or left)
 * @param separators - Number formatting separators
 * @param grandTotalsPosition - Position of grand totals rows (pinnedBottom, pinnedTop, bottom, top)
 * @param isFirstPage - Whether this is the first page of data (for "top" positioning)
 * @param isLastPage - Whether this is the last page of data (for "bottom" positioning)
 *
 * @internal
 */
export function dataViewToRowData(
    dataView: DataViewFacade,
    columnHeadersPosition: ColumnHeadersPosition,
    separators?: ISeparators,
    grandTotalsPosition: GrandTotalsPosition = "pinnedBottom",
    isFirstPage?: boolean,
    isLastPage?: boolean,
): {
    rowData: AgGridRowData[];
    grandTotalRowData: AgGridRowData[];
    grandTotalCount: number;
} {
    const tableData = dataView.data({ valueFormatter: createNumberJsFormatter(separators) }).asTable();

    const rowData: AgGridRowData[] = [];
    const grandTotalRowData: AgGridRowData[] = [];
    const tempGrandTotalRows: AgGridRowData[] = [];

    tableData.data.forEach((row, rowIndex) => {
        const data: AgGridRowData = { cellDataByColId: {}, allRowData: [] };

        row.forEach((cell) => {
            const key = columnDefinitionToColId(cell.columnDefinition, columnHeadersPosition);
            data.cellDataByColId[key] = cell;
            const dataValue = extractDataValue(cell);
            data.allRowData.push(dataValue);
        });

        if (tableData.rowDefinitions[rowIndex].type === "grandTotal") {
            tempGrandTotalRows.push(data);
        } else {
            rowData.push(data);
        }
    });

    // Handle grand total positioning based on configuration
    if (tempGrandTotalRows.length > 0) {
        if (grandTotalsPosition === "pinnedTop" || grandTotalsPosition === "pinnedBottom") {
            // For pinned positions, keep grand totals separate
            grandTotalRowData.push(...tempGrandTotalRows);
        } else if (grandTotalsPosition === "top") {
            // For non-pinned top, only include grand totals on the first page
            // to avoid duplicates when loading more data
            if (isFirstPage) {
                rowData.unshift(...tempGrandTotalRows);
            }
        } else {
            // For non-pinned bottom, only include grand totals on the last page
            // to avoid duplicates when loading more data
            if (isLastPage) {
                rowData.push(...tempGrandTotalRows);
            }
        }
    }

    return {
        rowData,
        grandTotalRowData,
        grandTotalCount: tempGrandTotalRows.length,
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
