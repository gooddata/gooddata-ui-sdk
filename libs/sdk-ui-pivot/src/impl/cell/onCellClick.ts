// (C) 2007-2025 GoodData Corporation
import { TableFacade } from "../tableFacade.js";
import { ICorePivotTableProps } from "../../publicTypes.js";
import { CellEvent, AgEventType } from "ag-grid-community";
import { invariant } from "ts-invariant";
import { IGridRow } from "../data/resultTypes.js";
import { isSomeTotal } from "../data/dataSourceUtils.js";
import {
    isMixedHeadersCol,
    isMixedValuesCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
    isSliceMeasureCol,
} from "../structure/tableDescriptorTypes.js";
import {
    convertDrillableItemsToPredicates,
    IDrillEvent,
    IDrillEventContextTable,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { isCellDrillable } from "../drilling/cellDrillabilityPredicate.js";
import { createDrilledRow } from "../drilling/drilledRowFactory.js";
import { createDrillIntersection } from "../drilling/drillIntersectionFactory.js";

export type CellClickedHandler = (cellEvent: CellEvent<AgEventType>) => boolean;

export function onCellClickedFactory(
    table: TableFacade,
    props: Readonly<ICorePivotTableProps>,
): CellClickedHandler {
    return (cellEvent: CellEvent<AgEventType>): boolean => {
        invariant(table.tableDescriptor);

        const row = cellEvent.data as IGridRow;

        invariant(row);

        if (isSomeTotal(row.type)) {
            return false;
        }

        const { colDef, data, rowIndex } = cellEvent;
        const col = table.tableDescriptor.getCol(colDef);

        if (isSliceMeasureCol(col) || isMixedHeadersCol(col)) {
            return false;
        }

        // cells belong to either slice column, leaf data column or mixed values column if table is transposed; if cells belong to column of a different
        // type then there must be either something messed up with table construction or a new type of cell
        invariant(
            isSliceCol(col) ||
                isSeriesCol(col) ||
                (table.tableDescriptor.isTransposed() && isScopeCol(col)) ||
                (table.tableDescriptor.isTransposed() && isMixedValuesCol(col)),
        );

        const { onDrill } = props;
        const dv = table.getDrillDataContext();
        const drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems!);

        const isTransposed = table.tableDescriptor.isTransposed();
        const columnHeadersPosition = props.config?.columnHeadersPosition ?? "top";
        const rowNodes = table.getRowNodes().slice(0, rowIndex!);

        const areDrillableHeaders = isCellDrillable(
            col,
            cellEvent.data,
            dv,
            drillablePredicates,
            columnHeadersPosition,
            isTransposed,
        );

        if (!areDrillableHeaders) {
            return false;
        }

        const drillContext: IDrillEventContextTable = {
            type: VisualizationTypes.TABLE,
            element: "cell",
            columnIndex: table.tableDescriptor.getAbsoluteLeafColIndex(col),
            rowIndex: rowIndex!,
            row: createDrilledRow(data as IGridRow, table.tableDescriptor),
            intersection: createDrillIntersection(cellEvent, table.tableDescriptor, rowNodes),
        };
        const drillEvent: IDrillEvent = {
            dataView: dv.dataView,
            drillContext,
        };

        if (onDrill?.(drillEvent)) {
            // This is needed for /analyze/embedded/ drilling with post message
            // More info: https://github.com/gooddata/gdc-analytical-designer/blob/develop/test/drillEventing/drillEventing_page.html
            const event = new CustomEvent("drill", {
                detail: drillEvent,
                bubbles: true,
            });
            cellEvent.event?.target?.dispatchEvent(event);
            return true;
        }

        return false;
    };
}
