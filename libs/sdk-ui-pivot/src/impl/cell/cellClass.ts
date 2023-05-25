// (C) 2007-2021 GoodData Corporation
import { CellClassParams } from "@ag-grid-community/all-modules";
import { TableFacade } from "../tableFacade.js";
import { ICorePivotTableProps } from "../../publicTypes.js";
import { IGridRow } from "../data/resultTypes.js";
import isEmpty from "lodash/isEmpty.js";
import cx from "classnames";
import { invariant } from "ts-invariant";
import { isSeriesCol, isRootCol } from "../structure/tableDescriptorTypes.js";
import { convertDrillableItemsToPredicates } from "@gooddata/sdk-ui";
import { COLUMN_TOTAL, COLUMN_SUBTOTAL, ROW_SUBTOTAL, ROW_TOTAL, MEASURE_COLUMN } from "../base/constants.js";
import { isCellDrillable } from "../drilling/cellDrillabilityPredicate.js";
import last from "lodash/last.js";
import { getCellClassNames } from "./cellUtils.js";

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

        invariant(!isRootCol(col));

        const drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems!);
        const isRowTotal = row.type === ROW_TOTAL;
        const isRowSubtotal = row.type === ROW_SUBTOTAL;
        const isColumnTotal = colDef.type === COLUMN_TOTAL;
        const isColumnSubtotal = colDef.type === COLUMN_SUBTOTAL;
        let hasDrillableHeader = false;

        const cellAllowsDrill = !isEmptyCell || colDef.type === MEASURE_COLUMN;
        const cellIsNotTotalSubtotal = !isRowTotal && !isRowSubtotal && !isColumnTotal && !isColumnSubtotal;

        if (cellIsNotTotalSubtotal && cellAllowsDrill) {
            hasDrillableHeader = isCellDrillable(col, row, dv, drillablePredicates);
        }

        const colIndex = table.tableDescriptor.getAbsoluteLeafColIndex(col);
        const measureIndex = isSeriesCol(col) ? last(col.fullIndexPathToHere) : undefined;
        const isPinnedRow = cellClassParams.node.isRowPinned();
        const hiddenCell = !isPinnedRow && table.getGroupingProvider().isRepeatedValue(col.id, rowIndex);
        const rowSeparator = !hiddenCell && table.getGroupingProvider().isGroupBoundary(rowIndex);
        const subtotalStyle = row?.subtotalStyle;

        // All new totals combinations
        const isColAndRowSubtotal = subtotalStyle && isColumnSubtotal;
        const isRowTotalAndColSubtotal = isRowTotal && isColumnSubtotal;
        const isRowAndColumnTotal = isRowTotal && isColumnTotal;
        const isRowSubtotalColumnTotal = isRowSubtotal && isColumnTotal;

        return cx(
            classList,
            measureIndex !== undefined ? `gd-column-measure-${measureIndex}` : null,
            getCellClassNames(rowIndex, colIndex, hasDrillableHeader),
            `gd-column-index-${colIndex}`,
            isRowTotal ? "gd-row-total" : null,
            isColumnTotal ? "gd-column-total" : null,
            isColumnSubtotal ? "gd-column-subtotal" : null,
            subtotalStyle ? `gd-table-row-subtotal gd-table-row-subtotal-${subtotalStyle}` : null,
            hiddenCell ? "gd-cell-hide s-gd-cell-hide" : null,
            rowSeparator ? "gd-table-row-separator s-gd-table-row-separator" : null,
            isTopPinned && isEmptyCell ? "gd-hidden-sticky-column" : null,
            // All new totals combinations
            isColAndRowSubtotal
                ? "gd-table-row-subtotal-column-subtotal s-table-row-subtotal-column-subtotal"
                : null,
            isRowTotalAndColSubtotal
                ? "gd-table-row-total-column-subtotal s-table-row-total-column-subtotal"
                : null,
            isRowAndColumnTotal ? "gd-table-row-total-column-total s-table-row-total-column-total" : null,
            isRowSubtotalColumnTotal
                ? "gd-table-row-subtotal-column-total s-table-row-subtotal-column-total"
                : null,
        );
    };
}
