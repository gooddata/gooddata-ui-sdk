// (C) 2025 GoodData Corporation

import { KeyboardEvent, useCallback } from "react";

import { CellClickedEvent, CellKeyDownEvent } from "ag-grid-enterprise";

import {
    IDrillEvent,
    IDrillEventContextTable,
    UnexpectedSdkError,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { isEnterKey, isSpaceKey } from "@gooddata/sdk-ui-kit";

import { useCurrentDataView } from "../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { createDrillIntersection } from "../features/drilling/intersection.js";
import { isCellDrillable } from "../features/drilling/isDrillable.js";
import { AgGridColumnDef, AgGridProps } from "../types/agGrid.js";
import { AgGridRowData } from "../types/internal.js";

/**
 * Returns ag-grid props with drilling applied.
 *
 * @alpha
 */
export function useDrillingProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { drillableItems, onDrill } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();

    const onCellClicked = useCallback(
        (
            event:
                | CellClickedEvent<AgGridRowData, string | null>
                | CellKeyDownEvent<AgGridRowData, string | null>,
        ) => {
            if (!onDrill || drillableItems.length === 0 || !currentDataView) {
                return false;
            }

            const { data, rowIndex, colDef } = event;
            if (!data || !colDef || rowIndex === null || rowIndex === undefined) {
                return false;
            }

            if (!isCellDrillable(colDef as AgGridColumnDef, data, drillableItems, currentDataView)) {
                return false;
            }

            const colId = colDef.colId ?? colDef.field;

            if (!colId) {
                return false;
            }

            const cellMeta = data.cellDataByColId?.[colId];

            if (!cellMeta) {
                return false;
            }

            const columnIndex = cellMeta.columnIndex;

            // Create a basic drill context
            const drillContext: IDrillEventContextTable = {
                type: VisualizationTypes.TABLE,
                element: "cell",
                columnIndex: columnIndex,
                rowIndex: rowIndex,
                row: data.allRowData,
                intersection: createDrillIntersection(colDef as AgGridColumnDef, data),
            };

            // Create drill event with actual dataView from context
            const drillEvent: IDrillEvent = {
                dataView: currentDataView.dataView,
                drillContext,
            };

            if (onDrill(drillEvent)) {
                // Dispatch custom drill event for embedded scenarios
                const customEvent = new CustomEvent("drill", {
                    detail: drillEvent,
                    bubbles: true,
                });
                event.event?.target?.dispatchEvent(customEvent);
                return true;
            }

            return false;
        },
        [onDrill, drillableItems, currentDataView],
    );

    const onCellKeyDown = useCallback(
        (event: CellKeyDownEvent<AgGridRowData, string | null>) => {
            if (!onDrill || drillableItems.length === 0) {
                return;
            }

            // Check if it's a keyboard event and if Enter or Space was pressed
            if (!event.event || !(event.event instanceof KeyboardEvent)) {
                return;
            }

            if (
                !isEnterKey(event.event as unknown as KeyboardEvent) &&
                !isSpaceKey(event.event as unknown as KeyboardEvent)
            ) {
                return;
            }

            // Trigger the same drill logic as cell click
            onCellClicked(event);
        },
        [onCellClicked, onDrill, drillableItems],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.onCellClicked) {
                throw new UnexpectedSdkError("onCellClicked is already set");
            }

            if (agGridReactProps.onCellKeyDown) {
                throw new UnexpectedSdkError("onCellKeyDown is already set");
            }

            return {
                ...agGridReactProps,
                onCellClicked,
                onCellKeyDown,
            };
        },
        [onCellClicked, onCellKeyDown],
    );
}
