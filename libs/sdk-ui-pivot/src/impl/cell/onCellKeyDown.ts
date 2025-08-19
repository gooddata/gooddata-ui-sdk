// (C) 2007-2025 GoodData Corporation
import { KeyboardEvent as ReactKeyboardEvent } from "react";

import { CellKeyDownEvent } from "ag-grid-community";
import { invariant } from "ts-invariant";

import {
    IDrillEvent,
    IDrillEventContextTable,
    VisualizationTypes,
    convertDrillableItemsToPredicates,
} from "@gooddata/sdk-ui";
import { isEnterKey, isSpaceKey } from "@gooddata/sdk-ui-kit";

import { ICorePivotTableProps } from "../../publicTypes.js";
import { isCellDrillable } from "../drilling/cellDrillabilityPredicate.js";
import { createDrilledRow } from "../drilling/drilledRowFactory.js";
import { createDrillIntersection } from "../drilling/drillIntersectionFactory.js";
import {
    isMixedHeadersCol,
    isMixedValuesCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
    isSliceMeasureCol,
} from "../structure/tableDescriptorTypes.js";
import { TableFacade } from "../tableFacade.js";

/**
 * Handles keyboard drilling for ag-Grid cells.
 * Only fires onDrill when Enter or Space is pressed on a drillable cell.
 * @internal
 */
export function onCellKeyDownFactory(
    table: TableFacade,
    props: Readonly<ICorePivotTableProps>,
): (event: CellKeyDownEvent) => void {
    return (event: CellKeyDownEvent) => {
        // Defensive: check event.event and cast to KeyboardEvent
        if (!event.event || !(event.event instanceof KeyboardEvent)) {
            return;
        }
        if (
            !isEnterKey(event.event as unknown as ReactKeyboardEvent) &&
            !isSpaceKey(event.event as unknown as ReactKeyboardEvent)
        ) {
            return;
        }

        invariant(table.tableDescriptor);
        const row = event.data;
        if (!row) return;

        const { colDef, data, rowIndex } = event;
        const col = table.tableDescriptor.getCol(colDef);
        if (!col) return;

        // Copy col type checks from onCellClickedFactory
        if (isSliceMeasureCol(col) || isMixedHeadersCol(col)) {
            return;
        }

        // cells belong to either slice column, leaf data column or mixed values column if table is transposed; if cells belong to column of a different
        // type then there must be either something messed up with table construction or a new type of cell
        invariant(
            isSliceCol(col) ||
                isSeriesCol(col) ||
                (table.tableDescriptor.isTransposed() && isScopeCol(col)) ||
                (table.tableDescriptor.isTransposed() && isMixedValuesCol(col)),
        );

        const dv = table.getDrillDataContext();
        const drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems ?? []);
        const isTransposed = table.tableDescriptor.isTransposed();
        const columnHeadersPosition = props.config?.columnHeadersPosition ?? "top";

        const isDrillable = isCellDrillable(
            col,
            data,
            dv,
            drillablePredicates,
            columnHeadersPosition,
            isTransposed,
        );

        if (!isDrillable) return;
        const { onDrill } = props;
        // Build drillContext and drillEvent as in onCellClickedFactory
        const rowNodes = table.getRowNodes().slice(0, rowIndex!);
        const drillContext: IDrillEventContextTable = {
            type: VisualizationTypes.TABLE,
            element: "cell",
            columnIndex: table.tableDescriptor.getAbsoluteLeafColIndex(col),
            rowIndex: rowIndex!,
            row: createDrilledRow(data, table.tableDescriptor),
            intersection: createDrillIntersection(event, table.tableDescriptor, rowNodes),
        };
        const drillEvent: IDrillEvent = {
            dataView: dv.dataView,
            drillContext,
        };
        if (typeof onDrill === "function") {
            onDrill(drillEvent);
        }
    };
}
