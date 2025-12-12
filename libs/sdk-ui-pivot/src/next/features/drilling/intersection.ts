// (C) 2025 GoodData Corporation

import {
    type IDrillEventIntersectionElement,
    type IMappingHeader,
    getDrillIntersection,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

import {
    extractAllColumnMappingHeaders,
    extractMappingHeadersUpToPosition,
    extractRowMappingHeadersUpToPosition,
} from "./headerMapping.js";
import {
    type AgGridColumnDef,
    type AgGridColumnGroupDef,
    isAgGridColumnGroupDef,
} from "../../types/agGrid.js";
import { type AgGridRowData } from "../../types/internal.js";

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
 * Creates mapping headers for drill intersection for a header cell
 *
 * @param colDef - The column definition from ag-grid
 * @returns Array of mapping headers
 */
function createHeaderMappingHeadersForIntersection(
    colDef: AgGridColumnDef | AgGridColumnGroupDef,
): IMappingHeader[] {
    const columnDefinition = colDef.context?.columnDefinition;

    if (!columnDefinition || !isValueColumnDefinition(columnDefinition)) {
        return [];
    }

    const columnScope = columnDefinition.columnScope;

    // With header groups, we use depth to determine which attributes to use for intersection
    // With regular columns, we use all column attributes
    const position = isAgGridColumnGroupDef(colDef)
        ? colDef.headerGroupComponentParams?.pivotGroupDepth
        : columnScope.length - 1;

    return extractMappingHeadersUpToPosition(columnDefinition.columnScope, position);
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

/**
 * Creates drill intersection elements for a header cell
 *
 * @param colDef - The column definition from ag-grid
 * @returns Array of drill intersection elements
 */
export function createHeaderDrillIntersection(colDef: AgGridColumnDef): IDrillEventIntersectionElement[] {
    const mappingHeaders = createHeaderMappingHeadersForIntersection(colDef);

    return getDrillIntersection(mappingHeaders);
}
