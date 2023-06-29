// (C) 2007-2021 GoodData Corporation
import { TableFacade } from "../tableFacade.js";
import { ColDef, ColGroupDef } from "@ag-grid-community/all-modules";
import cx from "classnames";
import {
    agColId,
    ColumnGroupingDescriptorId,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
} from "./tableDescriptorTypes.js";
import { ICorePivotTableProps } from "../../publicTypes.js";
import { isResultTotalHeader } from "@gooddata/sdk-model";
import { COLUMN_TOTAL, COLUMN_SUBTOTAL } from "../base/constants.js";

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

            return cx(
                classList,
                "gd-column-group-header",
                "s-table-column-group-header-descriptor",
                !tableDescriptor.sliceColCount() ? "gd-column-group-header--first" : null,
            );
        } else {
            const colDesc = tableDescriptor.getCol(colId);
            const treeIndexes = colDesc.fullIndexPathToHere;
            const indexWithinGroup = treeIndexes ? treeIndexes[treeIndexes.length - 1] : undefined;
            const noLeftBorder = tableDescriptor.isFirstCol(colId) || !tableDescriptor.hasScopingCols();
            const noBottomBorder = isScopeCol(colDesc) && isResultTotalHeader(colDesc.header);
            const topBottomSolidTotal =
                isScopeCol(colDesc) &&
                isResultTotalHeader(colDesc.header) &&
                colDesc.headersToHere.length === 0;
            const isColumnTotal = (colDef as ColDef).type === COLUMN_TOTAL;
            const isColumnSubtotal = (colDef as ColDef).type === COLUMN_SUBTOTAL;
            const absoluteColIndex = isSeriesCol(colDesc)
                ? tableDescriptor.getAbsoluteLeafColIndex(colDesc)
                : undefined;

            return cx(
                classList,
                "gd-column-group-header",
                // Funny stuff begin
                // NOTE: this funny stuff is here to mimic how selectors were originally created.it does not seem
                //  to make much sense :)
                indexWithinGroup !== undefined ? `gd-column-group-header-${indexWithinGroup}` : null,
                indexWithinGroup !== undefined
                    ? `s-table-measure-column-header-group-cell-${indexWithinGroup}`
                    : null,
                // Funny stuff end
                indexWithinGroup !== undefined && !isSliceCol(colDesc)
                    ? `s-table-measure-column-header-cell-${indexWithinGroup}`
                    : null,
                absoluteColIndex !== undefined
                    ? `s-table-measure-column-header-index-${absoluteColIndex}`
                    : null,
                noLeftBorder ? "gd-column-group-header--first" : null,
                noBottomBorder ? "gd-column-group-header--subtotal" : null,
                topBottomSolidTotal
                    ? "gd-column-group-header-total--first s-column-group-header-total--first"
                    : null,
                !colDef.headerName && !noBottomBorder ? "gd-column-group-header--empty" : null,
                isColumnTotal ? "gd-column-total" : null,
                isColumnSubtotal ? "gd-column-subtotal" : null,
            );
        }
    };
}
