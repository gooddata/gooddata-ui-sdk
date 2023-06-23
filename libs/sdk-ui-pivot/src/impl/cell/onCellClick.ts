// (C) 2007-2021 GoodData Corporation
import { TableFacade } from "../tableFacade";
import { ICorePivotTableProps } from "../../publicTypes";
import { CellEvent } from "@ag-grid-community/all-modules";
import { invariant } from "ts-invariant";
import { IGridRow } from "../data/resultTypes";
import { isSomeTotal } from "../data/dataSourceUtils";
import { isScopeCol, isSeriesCol, isSliceCol, isSliceMeasureCol } from "../structure/tableDescriptorTypes";
import {
    convertDrillableItemsToPredicates,
    IDrillEvent,
    IDrillEventContextTable,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { isCellDrillable } from "../drilling/cellDrillabilityPredicate";
import { createDrilledRow } from "../drilling/drilledRowFactory";
import { createDrillIntersection } from "../drilling/drillIntersectionFactory";

export type CellClickedHandler = (cellEvent: CellEvent) => boolean;

export function onCellClickedFactory(
    table: TableFacade,
    props: Readonly<ICorePivotTableProps>,
): CellClickedHandler {
    return (cellEvent: CellEvent): boolean => {
        invariant(table.tableDescriptor);

        const row = cellEvent.data as IGridRow;

        invariant(row);

        if (isSomeTotal(row.type)) {
            return false;
        }

        const { colDef, data, rowIndex } = cellEvent;
        const col = table.tableDescriptor.getCol(colDef);

        if(isSliceMeasureCol(col)) {
            return false;
        }

        // cells belong to either slice column or leaf data column; if cells belong to column of a different
        // type then there must be either something messed up with table construction or a new type of cell
        invariant(isSliceCol(col) || isSeriesCol(col) || (table.tableDescriptor.isTransposed() && isScopeCol(col)));

        const { onDrill } = props;
        const dv = table.getDrillDataContext();
        const drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems!);

        const areDrillableHeaders = isCellDrillable(col, cellEvent.data, dv, drillablePredicates);

        if (!areDrillableHeaders) {
            return false;
        }

        const drillContext: IDrillEventContextTable = {
            type: VisualizationTypes.TABLE,
            element: "cell",
            columnIndex: table.tableDescriptor.getAbsoluteLeafColIndex(col),
            rowIndex: rowIndex!,
            row: createDrilledRow(data as IGridRow, table.tableDescriptor),
            intersection: createDrillIntersection(cellEvent, table.tableDescriptor),
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
