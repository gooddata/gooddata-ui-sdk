// (C) 2007-2021 GoodData Corporation
import { TableFacade } from "../tableFacade";
import { ColDef, ColGroupDef } from "@ag-grid-community/all-modules";
import cx from "classnames";
import { agColId, ColumnGroupingDescriptorId, isSeriesCol, isSliceCol } from "./tableDescriptorTypes";
import { ICorePivotTableProps } from "../../publicTypes";

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
                !colDef.headerName ? "gd-column-group-header--empty" : null,
            );
        }
    };
}
