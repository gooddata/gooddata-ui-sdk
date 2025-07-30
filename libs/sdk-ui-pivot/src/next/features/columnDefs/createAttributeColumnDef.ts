// (C) 2025 GoodData Corporation
import { ITableAttributeColumnDefinition } from "@gooddata/sdk-ui";
import { ATTRIBUTE_EMPTY_VALUE } from "../../constants/internal.js";
import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";

/**
 * @internal
 */
export function createAttributeColumnDef(
    colId: string,
    columnDefinition: ITableAttributeColumnDefinition,
): AgGridColumnDef {
    const { attributeDescriptor } = columnDefinition;
    const attributeLocalIdentifier = attributeDescriptor.attributeHeader.localIdentifier;

    return {
        colId,
        field: colId,
        headerName: attributeDescriptor.attributeHeader.formOf.name,
        valueGetter: (params) => {
            return params.data?.[colId];
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
            const previousValue = previousRow?.data?.[attributeLocalIdentifier];
            const isSameValue = previousValue && previousValue === value;

            if (isSameValue) {
                return null;
            }

            return value;
        },
    };
}
