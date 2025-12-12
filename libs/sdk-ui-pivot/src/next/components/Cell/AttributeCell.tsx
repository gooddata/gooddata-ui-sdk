// (C) 2025 GoodData Corporation

import { type ICellRendererParams } from "ag-grid-enterprise";
import { type IntlShape } from "react-intl";

import { type ITableAttributeColumnDefinition, emptyHeaderTitleFromIntl } from "@gooddata/sdk-ui";

import {
    getAttributeColIds,
    isTableGrandTotalHeaderValue,
    isTableTotalHeaderValue,
    shouldGroupAttribute,
} from "../../features/columns/shared.js";
import { getPivotCellTestIdPropsFromCellTypes } from "../../testing/dataTestIdGenerators.js";
import { type CellTypes } from "../../types/cellRendering.js";

/**
 * Cell renderer for attributes.
 *
 * @internal
 */
export function AttributeCell(
    params: ICellRendererParams & {
        intl: IntlShape;
        colId: string;
        columnDefinition: ITableAttributeColumnDefinition;
        cellTypes?: CellTypes;
    },
) {
    const value = params.value;
    const colId = params.colId;
    const columnDefinition = params.columnDefinition;
    const dataTestIdProps = getPivotCellTestIdPropsFromCellTypes(params.cellTypes);

    // 1) Empty value handling - must be checked first
    if (!value) {
        return <span {...dataTestIdProps}>{emptyHeaderTitleFromIntl(params.intl)}</span>;
    }

    // 2) Total/grand-total header visibility: render title only in the first attribute column
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

        if (firstTotalAttrColId && firstTotalAttrColId !== params.colId) {
            return <span {...dataTestIdProps} />;
        }
    }

    // 3) Grouping suppression: do not render repeating attribute values
    const rowIndex = params.node.rowIndex;
    const previousRow = rowIndex ? params.api.getDisplayedRowAtIndex(rowIndex - 1) : null;

    if (!previousRow?.data) {
        return <span {...dataTestIdProps}>{value}</span>;
    }

    const shouldGroup = shouldGroupAttribute(params, previousRow, columnDefinition);

    if (shouldGroup) {
        return <span {...dataTestIdProps} />;
    }

    return <span {...dataTestIdProps}>{value}</span>;
}
