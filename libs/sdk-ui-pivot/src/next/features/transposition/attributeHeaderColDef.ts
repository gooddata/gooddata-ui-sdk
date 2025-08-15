// (C) 2025 GoodData Corporation
import { ITableValueColumnDefinition } from "@gooddata/sdk-ui";
import { metricCellRenderer, extractFormattedValue } from "../columns/shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { ATTRIBUTE_EMPTY_VALUE } from "../../constants/internal.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

/**
 * Creates attribute header col def (for transposed table).
 *
 * @internal
 */
export function createAttributeHeaderColDef(
    colId: string,
    columnDefinition: ITableValueColumnDefinition & ({ isTransposed: true } | { isEmpty: true }),
): AgGridColumnDef {
    const { attributeHeader } = columnDefinition;
    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
        },
        headerName:
            attributeHeader.attributeHeaderItem.formattedName ??
            attributeHeader.attributeHeaderItem.name ??
            attributeHeader.attributeHeaderItem.uri ??
            ATTRIBUTE_EMPTY_VALUE,
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        headerClass: getHeaderCellClassName,
        cellRenderer: metricCellRenderer,
        headerComponent: "AttributeHeader",
        sortable: false,
    };
}
