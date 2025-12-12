// (C) 2025 GoodData Corporation

import {
    type DataViewFacade,
    type ExplicitDrill,
    type IMappingHeader,
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

import {
    extractAllColumnMappingHeaders,
    extractAllRowMeasureMappingHeaders,
    extractRowMappingHeadersAtPosition,
} from "./headerMapping.js";
import { type AgGridColumnDef, type AgGridColumnGroupDef } from "../../types/agGrid.js";
import { type AgGridRowData } from "../../types/internal.js";

/**
 * Extracts headers for drill intersection for a cell
 *
 * @param colDef - The column definition from ag-grid
 * @param data - The row data from ag-grid
 * @param isTransposed - Whether the table is transposed
 * @returns Array of mapping headers
 */
function getCellDrillHeaders(
    colDef: AgGridColumnDef,
    data: AgGridRowData,
    isTransposed: boolean,
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
            ...extractRowMappingHeadersAtPosition(rowDefinition, columnDefinition.columnIndex),
        );
    }

    if (colData.type === "value") {
        if (isTransposed) {
            mappingHeaders.push(...extractAllRowMeasureMappingHeaders(rowDefinition));
        } else {
            mappingHeaders.push(...extractAllColumnMappingHeaders(columnDefinition));
        }
    }

    return mappingHeaders;
}

/**
 * Checks if a cell is drillable based on drillable items and cell data
 *
 * @param colDef - The column definition from ag-grid
 * @param data - The row data from ag-grid
 * @param drillableItems - Array of drillable items to check against
 * @param dv - Current data view facade for context
 * @param isTransposed - Whether the table is transposed
 * @returns True if the cell is drillable, false otherwise
 */
export function isCellDrillable(
    colDef: AgGridColumnDef,
    data: AgGridRowData,
    drillableItems: ExplicitDrill[],
    dataViewFacade?: DataViewFacade,
): boolean {
    const isTransposed = dataViewFacade?.data().asTable().isTransposed ?? false;
    const mappingHeaders = getCellDrillHeaders(colDef, data, isTransposed);
    if (mappingHeaders.length === 0 || !dataViewFacade) {
        return false;
    }

    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

    return mappingHeaders.some((header: IMappingHeader) =>
        isSomeHeaderPredicateMatched(drillablePredicates, header, dataViewFacade),
    );
}

/**
 * Extracts headers for drill intersection for a header cell
 *
 * @param colDef - The column definition from ag-grid
 * @param isTransposed - Whether the table is transposed
 * @param columnHeadersPosition - Position of column headers
 * @returns Array of mapping headers
 */
function getHeaderCellDrillHeaders(
    colDef: AgGridColumnDef | AgGridColumnGroupDef,
    isTransposed: boolean,
    columnHeadersPosition: string,
): IMappingHeader[] {
    // Header drilling only works in transposed mode with headers on left
    if (!isTransposed || columnHeadersPosition !== "left") {
        return [];
    }

    const columnDefinition = colDef.context?.columnDefinition;

    if (!columnDefinition) {
        return [];
    }

    if (!isValueColumnDefinition(columnDefinition)) {
        return [];
    }

    // For all valid header types, use the standard column mapping extraction
    return extractAllColumnMappingHeaders(columnDefinition);
}

/**
 * Checks if a header cell is drillable based on drillable items and column definition
 *
 * @param colDef - The column definition from ag-grid
 * @param drillableItems - Array of drillable items to check against
 * @param dataViewFacade - Current data view facade for context
 * @param columnHeadersPosition - Position of column headers ("left" or "top")
 * @returns True if the header cell is drillable, false otherwise
 */
export function isHeaderCellDrillable(
    colDef: AgGridColumnDef,
    drillableItems: ExplicitDrill[],
    dataViewFacade?: DataViewFacade,
    columnHeadersPosition?: string,
): boolean {
    if (!dataViewFacade || !columnHeadersPosition) {
        return false;
    }

    const isTransposed = dataViewFacade.data().asTable().isTransposed;

    const mappingHeaders = getHeaderCellDrillHeaders(colDef, isTransposed, columnHeadersPosition);

    if (mappingHeaders.length === 0) {
        return false;
    }

    const drillablePredicates = convertDrillableItemsToPredicates(drillableItems);

    return mappingHeaders.some((header: IMappingHeader) =>
        isSomeHeaderPredicateMatched(drillablePredicates, header, dataViewFacade),
    );
}
