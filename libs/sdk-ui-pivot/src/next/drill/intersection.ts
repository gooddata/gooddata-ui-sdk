// (C) 2025 GoodData Corporation
import { ColDef } from "ag-grid-community";
import { IMappingHeader, getDrillIntersection, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { AgGridRowData } from "../types/internal.js";
import { extractAllColumnMappingHeaders, extractRowMappingHeadersUpToPosition } from "./headerMapping.js";

/**
 * Creates mapping headers for drill intersection for a cell
 *
 * @param colDef - The column definition from ag-grid
 * @param data - The row data from ag-grid
 * @returns Array of mapping headers
 */
function createCellMappingHeadersForIntersection(
    colDef: ColDef<AgGridRowData, string | null>,
    data: AgGridRowData,
): IMappingHeader[] {
    const mappingHeaders: IMappingHeader[] = [];
    const colId = colDef.colId!;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const colData = data.meta[colId] as ITableDataValue;

    const rowDefinition = colData.rowDefinition;
    const columnDefinition = colData.columnDefinition;

    if (colData.type === "attributeHeader") {
        mappingHeaders.push(
            ...extractRowMappingHeadersUpToPosition(rowDefinition, columnDefinition.columnIndex),
        );
    }

    if (colData.type === "value") {
        mappingHeaders.push(
            ...extractRowMappingHeadersUpToPosition(rowDefinition, columnDefinition.columnIndex),
        );
        mappingHeaders.push(...extractAllColumnMappingHeaders(columnDefinition));
    }

    return mappingHeaders;
}

/**
 * Creates drill intersection elements for a cell
 *
 * @param colDef - The column definition from ag-grid
 * @param data - The row data from ag-grid
 * @returns Array of drill intersection elements
 */
export function createDrillIntersection(
    colDef: ColDef<AgGridRowData, string | null>,
    data: AgGridRowData,
): IDrillEventIntersectionElement[] {
    const mappingHeaders = createCellMappingHeadersForIntersection(colDef, data);

    return getDrillIntersection(mappingHeaders);
}
