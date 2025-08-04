// (C) 2025 GoodData Corporation
import { DataViewFacade, ExplicitDrill, ITableAttributeColumnDefinition } from "@gooddata/sdk-ui";
import { ATTRIBUTE_EMPTY_VALUE } from "../../constants/internal.js";
import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName } from "../styling/cell.js";
import { HEADER_CELL_CLASSNAME } from "../styling/bem.js";
import { extractFormattedValue } from "./shared.js";

/**
 * Creates col def for row attribute.
 *
 * @internal
 */
export function createAttributeColDef(
    colId: string,
    columnDefinition: ITableAttributeColumnDefinition,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const { attributeDescriptor } = columnDefinition;
    const attributeLocalIdentifier = attributeDescriptor.attributeHeader.localIdentifier;

    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        headerName: attributeDescriptor.attributeHeader.formOf.name,
        headerClass: HEADER_CELL_CLASSNAME,
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        context: {
            columnDefinition,
        },
        cellRenderer: (params: AgGridCellRendererParams) => {
            const value = params.value;
            if (!value) {
                return ATTRIBUTE_EMPTY_VALUE;
            }

            // Do not render repeating attribute values.
            const rowIndex = params.node.rowIndex;
            const previousRow = rowIndex ? params.api.getDisplayedRowAtIndex(rowIndex - 1) : null;
            const previousValue = extractFormattedValue(previousRow, attributeLocalIdentifier);
            const isSameValue = previousValue && previousValue === value;

            if (isSameValue) {
                return null;
            }

            return value;
        },
    };
}
