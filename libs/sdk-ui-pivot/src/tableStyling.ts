// (C) 2007-2021 GoodData Corporation
import { InternalTableState } from "./internalState";
import { CellClassParams, ColDef, ColGroupDef } from "@ag-grid-community/all-modules";
import { IGridRow } from "./impl/data/resultTypes";
import isEmpty from "lodash/isEmpty";
import cx from "classnames";
import { invariant } from "ts-invariant";
import {
    agColId,
    ColumnGroupingDescriptorId,
    isDataColLeaf,
    isDataColRootGroup,
    isSliceCol,
} from "./impl/structure/tableDescriptorTypes";
import { ROW_SUBTOTAL, ROW_TOTAL } from "./impl/base/constants";
import { isCellDrillable } from "./impl/drilling/cellDrillabilityPredicate";
import last from "lodash/last";
import { getCellClassNames } from "./impl/data/tableCell";
import { ICorePivotTableProps } from "./types";
import { convertDrillableItemsToPredicates } from "@gooddata/sdk-ui";

export type CellClassProvider = (cellClassParams: CellClassParams) => string;
export type HeaderClassProvider = (headerClassParams: any) => string;

export function cellClassFactory(
    table: InternalTableState,
    props: Readonly<ICorePivotTableProps>,
    classList?: string,
): CellClassProvider {
    return (cellClassParams: CellClassParams): string => {
        const { rowIndex, data } = cellClassParams;
        const row: IGridRow = data;
        const isEmptyCell = !cellClassParams.value;
        // hide empty sticky cells
        const isTopPinned = cellClassParams.node.rowPinned === "top";

        if (isEmpty(row)) {
            // ag-grid calls getCellClass before the data is available & rows are created - there will be no
            // data in the cellClassParams. not sure what is the purpose or whether that is a bug. anyway it
            // does not make sense to proceed further.
            //
            // ag-grid may call this with either data undefined or data being empty object

            // empty row data are also possible for pinned row, when no cell should be visible
            return cx(classList, isTopPinned && isEmptyCell ? "gd-hidden-sticky-column" : null);
        }

        const dv = table.visibleData;
        const colDef = cellClassParams.colDef;
        const col = table.tableDescriptor.getCol(colDef);

        invariant(!isDataColRootGroup(col));

        const drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems!);
        const isRowTotal = row.type === ROW_TOTAL;
        const isRowSubtotal = row.type === ROW_SUBTOTAL;
        let hasDrillableHeader = false;

        if (!isRowTotal && !isRowSubtotal && !isEmptyCell) {
            hasDrillableHeader = isCellDrillable(col, row, dv, drillablePredicates);
        }

        const colIndex = table.tableDescriptor.getAbsoluteLeafColIndex(col);
        const measureIndex = isDataColLeaf(col) ? last(col.fullIndexPathToHere) : undefined;
        const isPinnedRow = cellClassParams.node.isRowPinned();
        const hiddenCell = !isPinnedRow && table.getGroupingProvider().isRepeatedValue(col.id, rowIndex);
        const rowSeparator = !hiddenCell && table.getGroupingProvider().isGroupBoundary(rowIndex);
        const subtotalStyle = row?.subtotalStyle;

        return cx(
            classList,
            measureIndex !== undefined ? `gd-column-measure-${measureIndex}` : null,
            getCellClassNames(rowIndex, colIndex, hasDrillableHeader),
            `gd-column-index-${colIndex}`,
            isRowTotal ? "gd-row-total" : null,
            subtotalStyle ? `gd-table-row-subtotal gd-table-row-subtotal-${subtotalStyle}` : null,
            hiddenCell ? "gd-cell-hide s-gd-cell-hide" : null,
            rowSeparator ? "gd-table-row-separator s-gd-table-row-separator" : null,
            isTopPinned && isEmptyCell ? "gd-hidden-sticky-column" : null,
        );
    };
}

export function headerClassFactory(
    table: InternalTableState,
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
            const noLeftBorder = tableDescriptor.isFirstCol(colId) || !tableDescriptor.hasGroupedDataCols();
            const absoluteColIndex = isDataColLeaf(colDesc)
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
