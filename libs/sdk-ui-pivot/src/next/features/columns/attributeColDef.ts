// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import {
    DataViewFacade,
    ExplicitDrill,
    ITableAttributeColumnDefinition,
    emptyHeaderTitleFromIntl,
    isTableGrandTotalHeaderValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

import { extractIntlFormattedValue, getAttributeColIds, shouldGroupAttribute } from "./shared.js";
import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";
import { HEADER_CELL_CLASSNAME } from "../styling/bem.js";
import { getCellClassName } from "../styling/cell.js";

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
        cellRenderer: (params: AgGridCellRendererParams) => {
            const value = params.value;
            if (!value) {
                return emptyHeaderTitleFromIntl(intl);
            }

            // If this is a total/grand-total header cell, render the title only in the first
            // attribute column that carries the total header in this row. Hide it in others.
            const cellData = params.data?.cellDataByColId?.[colId];
            const isTotalHeaderCell =
                !!cellData && (isTableTotalHeaderValue(cellData) || isTableGrandTotalHeaderValue(cellData));

            if (isTotalHeaderCell) {
                const attributeColIds = getAttributeColIds(params.data);

                // Find the first attribute column (by columnIndex) that has a total/grand-total header in this row
                const firstTotalAttrColId = attributeColIds
                    .filter((id) => {
                        const c = params.data?.cellDataByColId?.[id];
                        return !!c && (isTableTotalHeaderValue(c) || isTableGrandTotalHeaderValue(c));
                    })
                    .sort((a, b) => {
                        const ai = params.data!.cellDataByColId![a].columnDefinition.columnIndex;
                        const bi = params.data!.cellDataByColId![b].columnDefinition.columnIndex;
                        return ai - bi;
                    })[0];

                if (firstTotalAttrColId && firstTotalAttrColId !== colId) {
                    return null;
                }
            }

            // Do not render repeating attribute values.
            const rowIndex = params.node.rowIndex;
            const previousRow = rowIndex ? params.api.getDisplayedRowAtIndex(rowIndex - 1) : null;

            if (!previousRow?.data) {
                return value;
            }

            const shouldGroup = shouldGroupAttribute(params, previousRow, columnDefinition);

            if (shouldGroup) {
                return null;
            }

            return value;
        },
        headerComponent: "AttributeHeader",
    };
}
