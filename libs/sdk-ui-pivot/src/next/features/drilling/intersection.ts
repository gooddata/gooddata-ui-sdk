// (C) 2025 GoodData Corporation
import { IDrillEventIntersectionElement, IMappingHeader, getDrillIntersection } from "@gooddata/sdk-ui";

import { extractAllColumnMappingHeaders, extractRowMappingHeadersUpToPosition } from "./headerMapping.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";

/**
 * Creates mapping headers for drill intersection for a cell
 *
 * @param colDef - The column definition from ag-grid
 * @param data - The row data from ag-grid
 * @returns Array of mapping headers
 */
function createCellMappingHeadersForIntersection(
    colDef: AgGridColumnDef,
    data: AgGridRowData,
): IMappingHeader[] {
    const mappingHeaders: IMappingHeader[] = [];
    const colId = colDef.colId ?? colDef.field;

    if (!colId) {
        return [];
    }

    const colData = data.cellDataByColId?.[colId];

    if (!colData) {
        return [];
    }

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
    colDef: AgGridColumnDef,
    data: AgGridRowData,
): IDrillEventIntersectionElement[] {
    const mappingHeaders = createCellMappingHeadersForIntersection(colDef, data);

    return getDrillIntersection(mappingHeaders);
}
