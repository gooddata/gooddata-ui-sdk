// (C) 2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type ITableAttributeColumnDefinition } from "@gooddata/sdk-ui";

import { extractIntlFormattedValue } from "./shared.js";
import { AttributeCell } from "../../components/Cell/AttributeCell.js";
import { type AgGridColumnDef } from "../../types/agGrid.js";
import { HEADER_CELL_CLASSNAME } from "../styling/bem.js";

/**
 * Creates col def for row attribute.
 *
 * @internal
 */
export function createAttributeColDef(
    colId: string,
    columnDefinition: ITableAttributeColumnDefinition,
    intl: IntlShape,
): AgGridColumnDef {
    const { attributeDescriptor } = columnDefinition;

    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        headerName: attributeDescriptor.attributeHeader.formOf.name,
        headerClass: HEADER_CELL_CLASSNAME,
        valueGetter: (params) => {
            return extractIntlFormattedValue(params, colId, intl);
        },
        context: {
            columnDefinition,
            cellRendererFactory: (params, cellTypes) =>
                AttributeCell({ ...params, intl, colId, columnDefinition, cellTypes }),
        },
        headerComponent: "AttributeHeader",
    };
}
