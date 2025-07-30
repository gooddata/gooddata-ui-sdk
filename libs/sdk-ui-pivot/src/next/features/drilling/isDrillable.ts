// (C) 2025 GoodData Corporation
import {
    IMappingHeader,
    isSomeHeaderPredicateMatched,
    convertDrillableItemsToPredicates,
    DataViewFacade,
    ExplicitDrill,
} from "@gooddata/sdk-ui";
import { AgGridRowData } from "../../types/internal.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import {
    extractAllColumnMappingHeaders,
    extractAllRowMeasureMappingHeaders,
    extractRowMappingHeadersAtPosition,
} from "./headerMapping.js";

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
    const colId = colDef.colId ?? colDef.field; // TODO: why?
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const colData = data.meta[colId] as ITableDataValue;

    const rowDefinition = colData.rowDefinition;
    const columnDefinition = colData.columnDefinition;

    if (colData.type === "attributeHeader") {
        mappingHeaders.push(
            ...extractRowMappingHeadersAtPosition(rowDefinition, columnDefinition.columnIndex),
        );
    }

    if (colData.type === "value") {
        if (!isTransposed) {
            mappingHeaders.push(...extractAllColumnMappingHeaders(columnDefinition));
        } else {
            mappingHeaders.push(...extractAllRowMeasureMappingHeaders(rowDefinition));
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
