// (C) 2025 GoodData Corporation

import { KeyboardEvent as ReactKeyboardEvent, useCallback, useRef } from "react";

import {
    CellClickedEvent,
    CellKeyDownEvent,
    CellMouseDownEvent,
    CellMouseOverEvent,
} from "ag-grid-enterprise";

import {
    IDrillEvent,
    IDrillEventContextTable,
    UnexpectedSdkError,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { isEnterKey, isSpaceKey } from "@gooddata/sdk-ui-kit";

import { useCurrentDataView } from "../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { createCustomDrillEvent } from "../features/drilling/events.js";
import { createDrillIntersection } from "../features/drilling/intersection.js";
import { isCellDrillable } from "../features/drilling/isDrillable.js";
import { AgGridColumnDef, AgGridProps } from "../types/agGrid.js";
import { AgGridRowData } from "../types/internal.js";

/**
 * Returns ag-grid props with interactions applied.
 *
 * For selection of single cell, we try to check if the user is dragging the mouse. If not, we drill.
 * If the user is dragging the mouse, we don't drill.
 *
 * @alpha
 */
export function useInteractionProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { drillableItems, onDrill } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();
    const isDraggingRef = useRef<boolean>(false);
    const clickedCellRef = useRef<{ rowIndex: number; colId: string | undefined } | null>(null);

    const drillFromCellEvent = useCallback(
        (
            event:
                | CellClickedEvent<AgGridRowData, string | null>
                | CellKeyDownEvent<AgGridRowData, string | null>,
        ) => {
            if (!onDrill || drillableItems.length === 0 || !currentDataView) {
                return;
            }

            const { data, rowIndex, colDef } = event;
            if (!data || !colDef || rowIndex === null || rowIndex === undefined) {
                return;
            }

            if (!isCellDrillable(colDef as AgGridColumnDef, data, drillableItems, currentDataView)) {
                return;
            }

            const colId = colDef.colId ?? colDef.field;

            if (!colId) {
                return;
            }

            const cellMeta = data.cellDataByColId?.[colId];

            if (!cellMeta) {
                return;
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
                const customEvent = createCustomDrillEvent(drillEvent);
                event.event?.target?.dispatchEvent(customEvent);
            }
        },
        [onDrill, drillableItems, currentDataView],
    );

    const onCellMouseDown = useCallback((event: CellMouseDownEvent<AgGridRowData, string | null>) => {
        // Track the cell where mouse down occurred
        const colId = event.colDef?.colId ?? event.colDef?.field;
        clickedCellRef.current = {
            rowIndex: event.rowIndex ?? -1,
            colId,
        };
        isDraggingRef.current = false;
    }, []);

    const onCellMouseOver = useCallback((event: CellMouseOverEvent<AgGridRowData, string | null>) => {
        // If mouse moves over a different cell while mouse is down, it's a drag
        if (clickedCellRef.current) {
            const colId = event.colDef?.colId ?? event.colDef?.field;
            const currentCell = {
                rowIndex: event.rowIndex ?? -1,
                colId,
            };

            if (
                currentCell.rowIndex !== clickedCellRef.current.rowIndex ||
                currentCell.colId !== clickedCellRef.current.colId
            ) {
                isDraggingRef.current = true;
            }
        }
    }, []);

    const onCellClicked = useCallback(
        (event: CellClickedEvent<AgGridRowData, string | null>) => {
            // Only drill if user didn't drag (simple click)
            if (!isDraggingRef.current) {
                drillFromCellEvent(event);
            }

            // Reset state
            clickedCellRef.current = null;
            isDraggingRef.current = false;
        },
        [drillFromCellEvent],
    );

    const onCellSelectionChanged = useCallback(() => {
        // Mark that a range selection occurred
        isDraggingRef.current = true;
    }, []);

    const onCellKeyDown = useCallback(
        (event: CellKeyDownEvent<AgGridRowData, string | null>) => {
            if (!onDrill || drillableItems.length === 0) {
                return;
            }

            // Check if it's a keyboard event and if Enter or Space was pressed
            if (!event.event || !(event.event instanceof KeyboardEvent)) {
                return;
            }

            // Drill via keyboard: ENTER or SPACE pressed on a drillable cell
            // Cast to ReactKeyboardEvent for helpers that expect React's typing shape
            if (
                !isEnterKey(event.event as unknown as ReactKeyboardEvent) &&
                !isSpaceKey(event.event as unknown as ReactKeyboardEvent)
            ) {
                return;
            }

            // Trigger same drill logic
            drillFromCellEvent(event);
        },
        [drillFromCellEvent, onDrill, drillableItems],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.onCellClicked) {
                throw new UnexpectedSdkError("onCellClicked is already set");
            }

            if (agGridReactProps.onCellKeyDown) {
                throw new UnexpectedSdkError("onCellKeyDown is already set");
            }

            if (agGridReactProps.onCellSelectionChanged) {
                throw new UnexpectedSdkError("onCellSelectionChanged is already set");
            }

            if (agGridReactProps.onCellMouseDown) {
                throw new UnexpectedSdkError("onCellMouseDown is already set");
            }

            if (agGridReactProps.onCellMouseOver) {
                throw new UnexpectedSdkError("onCellMouseOver is already set");
            }

            return {
                ...agGridReactProps,
                onCellClicked,
                onCellKeyDown,
                onCellSelectionChanged,
                onCellMouseDown,
                onCellMouseOver,
            };
        },
        [onCellClicked, onCellKeyDown, onCellSelectionChanged, onCellMouseDown, onCellMouseOver],
    );
}
