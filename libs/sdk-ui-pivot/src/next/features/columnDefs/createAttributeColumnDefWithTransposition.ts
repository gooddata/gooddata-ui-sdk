// (C) 2025 GoodData Corporation
import { IResultAttributeHeader } from "@gooddata/sdk-model";
import { ITableColumnDefinition } from "@gooddata/sdk-ui";
import { metricCellRenderer } from "./shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { ATTRIBUTE_EMPTY_VALUE } from "../../constants/internal.js";

/**
 * @internal
 */
export function createAttributeColumnDefWithTransposition(
    colId: string,
    columnDefinition: ITableColumnDefinition,
    attributeHeader: IResultAttributeHeader,
): AgGridColumnDef {
    return {
        colId,
        field: colId,
        context: {
            columnDefinition,
        },
        headerName:
            attributeHeader.attributeHeaderItem.formattedName ??
            attributeHeader.attributeHeaderItem.name ??
            attributeHeader.attributeHeaderItem.uri ??
            ATTRIBUTE_EMPTY_VALUE,
        valueGetter: (params) => {
            return params.data?.[colId];
        },
        cellRenderer: metricCellRenderer,
    };
}
