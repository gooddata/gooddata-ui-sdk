// (C) 2007-2021 GoodData Corporation
import { CellClassParams } from "@ag-grid-community/all-modules";
import { TableFacade } from "../tableFacade";
import { ICorePivotTableProps } from "../../publicTypes";
import { IGridRow } from "../data/resultTypes";
import isEmpty from "lodash/isEmpty";
import cx from "classnames";
import { invariant } from "ts-invariant";
import { isDataColLeaf, isDataColRootGroup } from "../structure/tableDescriptorTypes";
import { convertDrillableItemsToPredicates } from "@gooddata/sdk-ui";
import { ROW_SUBTOTAL, ROW_TOTAL } from "../base/constants";
import { isCellDrillable } from "../drilling/cellDrillabilityPredicate";
import last from "lodash/last";
import { getCellClassNames } from "./cellUtils";

export type CellClassProvider = (cellClassParams: CellClassParams) => string;

export function cellClassFactory(
    table: TableFacade,
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

        const dv = table.getDrillDataContext();
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
