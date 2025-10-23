// (C) 2025 GoodData Corporation

import { ICellRendererParams } from "ag-grid-enterprise";
import { IntlShape } from "react-intl";

import { DataViewFacade, ExplicitDrill, ITableAttributeColumnDefinition } from "@gooddata/sdk-ui";

import { extractIntlFormattedValue } from "./shared.js";
import { AttributeCell } from "../../components/Cell/AttributeCell.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { HEADER_CELL_CLASSNAME } from "../styling/bem.js";
import { getCellClassName, getCellTypes } from "../styling/cell.js";

/**
 * Creates col def for row attribute.
 *
 * @internal
 */
export function createAttributeColDef(
    colId: string,
    columnDefinition: ITableAttributeColumnDefinition,
    intl: IntlShape,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const { attributeDescriptor } = columnDefinition;

    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        headerName: attributeDescriptor.attributeHeader.formOf.name,
        headerClass: HEADER_CELL_CLASSNAME,
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
        valueGetter: (params) => {
            return extractIntlFormattedValue(params, colId, intl);
        },
        context: {
            columnDefinition,
        },
        cellRenderer: (params: ICellRendererParams) => {
            const cellTypes = getCellTypes(params, drillableItems, dv);
            return AttributeCell({ ...params, intl, colId, columnDefinition, cellTypes });
        },
        headerComponent: "AttributeHeader",
    };
}
