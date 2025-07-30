// (C) 2025 GoodData Corporation
import { DataViewFacade, ExplicitDrill, ITableAttributeColumnDefinition } from "@gooddata/sdk-ui";
import { ATTRIBUTE_EMPTY_VALUE } from "../../constants/internal.js";
import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName } from "../styling/cell.js";
import { e } from "../styling/bem.js";

/**
 * @internal
 */
export function createAttributeColumnDef(
    colId: string,
    columnDefinition: ITableAttributeColumnDefinition,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const { attributeDescriptor } = columnDefinition;
    const attributeLocalIdentifier = attributeDescriptor.attributeHeader.localIdentifier;

    return {
        colId,
        field: colId,
        headerName: attributeDescriptor.attributeHeader.formOf.name,
        headerClass: e("header-cell"),
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
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
