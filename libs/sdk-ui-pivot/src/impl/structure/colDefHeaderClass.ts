// (C) 2007-2025 GoodData Corporation
import { type ColDef, type ColGroupDef } from "ag-grid-community";
import cx from "classnames";

import { isResultTotalHeader } from "@gooddata/sdk-model";

import { type TableDescriptor } from "./tableDescriptor.js";
import {
    type AnyCol,
    ColumnGroupingDescriptorId,
    agColId,
    isMixedHeadersCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
    isSliceMeasureCol,
} from "./tableDescriptorTypes.js";
import { type ICorePivotTableProps } from "../../publicTypes.js";
import { COLUMN_ATTRIBUTE_COLUMN, COLUMN_SUBTOTAL, COLUMN_TOTAL } from "../base/constants.js";
import { type TableFacade } from "../tableFacade.js";

export type HeaderClassProvider = (headerClassParams: any) => string;

export function headerClassFactory(
    table: TableFacade,
    _props: Readonly<ICorePivotTableProps>,
    classList?: string,
): HeaderClassProvider {
    return (headerClassParams: any): string => {
        const { tableDescriptor } = table;
        const colDef: ColDef | ColGroupDef = headerClassParams.colDef;
        const colId = agColId(colDef);

        if (!colId) {
            return cx(classList);
        }

        if (colId === ColumnGroupingDescriptorId) {
            // This is the special, presentation-only ColGroupDef which communicates to the user
            // what attributes are used for grouping the column header.

            const noColumnBefore =
                !tableDescriptor.sliceColCount() &&
                !tableDescriptor.sliceMeasureColCount() &&
                !tableDescriptor.hasHeadersOnLeft();

            return cx(
                classList,
                "gd-column-group-header",
                "s-table-column-group-header-descriptor",
                noColumnBefore ? "gd-column-group-header--first" : null,
            );
        } else {
            const colDesc = tableDescriptor.getCol(colId);
            const treeIndexes = colDesc.fullIndexPathToHere;
            const indexWithinGroup = treeIndexes ? treeIndexes[treeIndexes.length - 1] : undefined;
            const noLeftBorder = tableDescriptor.isFirstCol(colId) || !tableDescriptor.hasScopingCols();
            const noBottomBorder =
                getNoBottomBorderGroupHeader(colDesc, tableDescriptor) ||
                hasEmptyChild(colDef as ColGroupDef, colDesc);
            const topBottomSolidTotal =
                isScopeCol(colDesc) &&
                isResultTotalHeader(colDesc.header) &&
                colDesc.headersToHere.length === 0;
            const isColumnTotal = getColumnTotals(colDef, colDesc, tableDescriptor);
            const isColumnSubtotal = getColumnSubTotals(colDef, colDesc, tableDescriptor);
            const absoluteColIndex = isSeriesCol(colDesc)
                ? tableDescriptor.getAbsoluteLeafColIndex(colDesc)
                : undefined;
            const isTransposedHeader =
                isScopeCol(colDesc) &&
                tableDescriptor.isTransposed() &&
                (colDef as ColDef).type === COLUMN_ATTRIBUTE_COLUMN;
            const isSliceMeasure = isSliceMeasureCol(colDesc);

            return cx(
                classList,
                "gd-column-group-header",
                // Funny stuff begin
                // NOTE: this funny stuff is here to mimic how selectors were originally created.it does not seem
                //  to make much sense :)
                indexWithinGroup === undefined ? null : `gd-column-group-header-${indexWithinGroup}`,
                indexWithinGroup === undefined
                    ? null
                    : `s-table-measure-column-header-group-cell-${indexWithinGroup}`,
                // Funny stuff end
                indexWithinGroup !== undefined && !isSliceCol(colDesc)
                    ? `s-table-measure-column-header-cell-${indexWithinGroup}`
                    : null,
                absoluteColIndex === undefined
                    ? null
                    : `s-table-measure-column-header-index-${absoluteColIndex}`,
                noLeftBorder ? "gd-column-group-header--first" : null,
                noBottomBorder ? "gd-column-group-header--subtotal" : null,
                topBottomSolidTotal
                    ? "gd-column-group-header-total--first s-column-group-header-total--first"
                    : null,
                !colDef.headerName && !noBottomBorder && !tableDescriptor.isTransposed()
                    ? "gd-column-group-header--empty"
                    : null,
                isColumnTotal ? "gd-column-total" : null,
                isColumnSubtotal ? "gd-column-subtotal" : null,
                isTransposedHeader ? "gd-transpose-header" : null,
                isSliceMeasure ? "gd-row-slice-measure-header" : null,
            );
        }
    };
}

function getColumnTotals(colDef: ColDef, colDesc: AnyCol, tableDescriptor: TableDescriptor) {
    if (tableDescriptor.isTransposed()) {
        return isScopeCol(colDesc) && colDesc.isTotal === true;
    } else {
        return colDef.type === COLUMN_TOTAL;
    }
}

function getColumnSubTotals(colDef: ColDef, colDesc: AnyCol, tableDescriptor: TableDescriptor) {
    if (tableDescriptor.isTransposed()) {
        return isScopeCol(colDesc) && colDesc.isSubtotal === true;
    } else {
        return colDef.type === COLUMN_SUBTOTAL;
    }
}

function getNoBottomBorderGroupHeader(colDesc: AnyCol, tableDescriptor: TableDescriptor) {
    if (tableDescriptor.isTransposed()) {
        return (
            isScopeCol(colDesc) &&
            isResultTotalHeader(colDesc.header) &&
            colDesc.headersToHere.length === 0 &&
            colDesc.children?.length > 0
        );
    } else {
        return isScopeCol(colDesc) && isResultTotalHeader(colDesc.header);
    }
}

function hasEmptyChild(colDef: ColGroupDef, colDesc: AnyCol) {
    return isMixedHeadersCol(colDesc) && colDef.children?.[0]?.headerName === "";
}
