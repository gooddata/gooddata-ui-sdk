// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent as ReactKeyboardEvent, useCallback, useRef } from "react";

import {
    type CellClickedEvent,
    type CellKeyDownEvent,
    type CellMouseDownEvent,
    type CellMouseOverEvent,
} from "ag-grid-enterprise";

import {
    type IDrillEvent,
    type IDrillEventContextTable,
    UnexpectedSdkError,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import {
    findFocusableElementOutsideContainer,
    isEnterKey,
    isEscapeKey,
    isSpaceKey,
    makeKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";

import { useCurrentDataView } from "../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { useSyncDrillableItems } from "./drilling/useSyncDrillableItems.js";
import { createCustomDrillEvent } from "../features/drilling/events.js";
import { createDrillIntersection } from "../features/drilling/intersection.js";
import { isCellDrillable } from "../features/drilling/isDrillable.js";
import {
    type AgGridApi,
    type AgGridColumn,
    type AgGridColumnDef,
    type AgGridProps,
} from "../types/agGrid.js";
import { type AgGridRowData } from "../types/internal.js";

/**
 * Keyboard navigation action map for pivot table
 */
const tableKeyboardNavigation = makeKeyboardNavigation({
    onHomeNormal: [{ code: "Home", modifiers: ["!Control", "!Meta"] }],
    onHomeWithModifier: [
        { code: "Home", modifiers: ["Control"] },
        { code: "Home", modifiers: ["Meta"] },
    ],
    onEndNormal: [{ code: "End", modifiers: ["!Control", "!Meta"] }],
    onEndWithModifier: [
        { code: "End", modifiers: ["Control"] },
        { code: "End", modifiers: ["Meta"] },
    ],
    onSelectColumn: [{ code: "Space", modifiers: ["Control"] }],
    onSelectRow: [{ code: "Space", modifiers: ["Shift", "!Control", "!Meta"] }],
});

/**
 * Returns ag-grid props with interactions applied.
 *
 * Handles:
 * - Cell drilling on click and keyboard (Enter/Space without modifiers)
 * - Mouse drag detection for cell selection
 * - Custom keyboard navigation (ArrowUp, PageUp/Down, Home/End, Ctrl+Home/End)
 * - Column selection (Ctrl+Space)
 * - Row selection (Shift+Space)
 * - Tab key to exit grid
 * - Escape key to blur
 *
 * @alpha
 */
export function useInteractionProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { drillableItems, onDrill } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();
    const isDraggingRef = useRef<boolean>(false);
    const clickedCellRef = useRef<{ rowIndex: number; colId: string | undefined } | null>(null);

    // Sync drillable items changes to ag-grid cells
    useSyncDrillableItems();

    const drillFromCellEvent = useCallback(
        (
            event:
                | CellClickedEvent<AgGridRowData, string | null>
                | CellKeyDownEvent<AgGridRowData, string | null>,
        ) => {
            if (!onDrill || !drillableItems || !currentDataView) {
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

            const cord = getChartCoordinates(event);

            // Create drill event with actual dataView from context
            const drillEvent: IDrillEvent = {
                dataView: currentDataView.dataView,
                drillContext,
                ...cord,
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

    /**
     * Navigate to first column (and optionally first row with modifier)
     */
    const navigateToHome = useCallback((api: AgGridApi, row: number, withModifier: boolean) => {
        const allColumns = api.getAllDisplayedColumns();
        if (allColumns && allColumns.length > 0) {
            const firstColumn = allColumns[0];
            const targetRow = withModifier ? 0 : row;

            api.clearCellSelection();

            if (withModifier) {
                api.ensureIndexVisible(0);
            }
            api.ensureColumnVisible(firstColumn);

            api.setFocusedCell(targetRow, firstColumn);
            api.addCellRange({
                rowStartIndex: targetRow,
                rowEndIndex: targetRow,
                columns: [firstColumn],
            });
        }
    }, []);

    /**
     * Navigate to last column (and optionally last row with modifier)
     */
    const navigateToEnd = useCallback((api: AgGridApi, row: number, withModifier: boolean) => {
        const allColumns = api.getAllDisplayedColumns();
        if (allColumns && allColumns.length > 0) {
            const lastColumn = allColumns[allColumns.length - 1];
            let targetRow = row;

            if (withModifier) {
                const displayedRowCount = api.getDisplayedRowCount();
                if (displayedRowCount > 0) {
                    targetRow = displayedRowCount - 1;
                }
            }

            api.clearCellSelection();

            if (withModifier) {
                api.ensureIndexVisible(targetRow);
            }
            api.ensureColumnVisible(lastColumn);

            api.setFocusedCell(targetRow, lastColumn);
            api.addCellRange({
                rowStartIndex: targetRow,
                rowEndIndex: targetRow,
                columns: [lastColumn],
            });
        }
    }, []);

    /**
     * Select entire column containing the focused cell
     */
    const selectColumn = useCallback((api: AgGridApi, column: AgGridColumn) => {
        const displayedRowCount = api.getDisplayedRowCount();
        if (displayedRowCount > 0) {
            api.clearCellSelection();
            api.addCellRange({
                rowStartIndex: 0,
                rowEndIndex: displayedRowCount - 1,
                columns: [column],
            });
        }
    }, []);

    /**
     * Select entire row containing the focused cell
     */
    const selectRow = useCallback((api: AgGridApi, row: number) => {
        const allColumns = api.getAllDisplayedColumns();
        if (allColumns && allColumns.length > 0) {
            api.clearCellSelection();
            api.addCellRange({
                rowStartIndex: row,
                rowEndIndex: row,
                columns: allColumns,
            });
        }
    }, []);

    const onCellKeyDown = useCallback(
        (event: CellKeyDownEvent<AgGridRowData, string | null>) => {
            // Check if it's a keyboard event
            if (!event.event || !(event.event instanceof KeyboardEvent)) {
                return;
            }

            // Cast to ReactKeyboardEvent for helpers that expect React's typing shape
            const keyboardEvent = event.event as unknown as ReactKeyboardEvent;

            // Handle Tab key: find next/previous focusable element outside grid and focus it
            if (keyboardEvent.key === "Tab") {
                // Prevent default Tab behavior
                keyboardEvent.preventDefault();
                keyboardEvent.stopPropagation();

                // Clear AG Grid's internal focus state
                event.api.clearFocusedCell();

                const eventTarget = keyboardEvent.target as HTMLElement;
                if (!eventTarget) {
                    return;
                }

                // Find the next/previous focusable element outside the grid
                const direction = keyboardEvent.shiftKey ? "backward" : "forward";
                const targetElement = findFocusableElementOutsideContainer(eventTarget, direction);

                if (targetElement) {
                    targetElement.focus();
                }

                return;
            }

            // Blur focused element when Escape is pressed, which will trigger onBlur and clear selection
            if (isEscapeKey(keyboardEvent)) {
                const activeElement = document.activeElement as HTMLElement;
                activeElement?.blur();
                return;
            }

            // Handle custom keyboard navigation (Home/End with and without modifiers, column/row selection)
            const { api, rowIndex, column } = event;
            if (column && rowIndex !== null && rowIndex !== undefined) {
                tableKeyboardNavigation(
                    {
                        onHomeNormal: () => navigateToHome(api, rowIndex, false),
                        onHomeWithModifier: () => navigateToHome(api, rowIndex, true),
                        onEndNormal: () => navigateToEnd(api, rowIndex, false),
                        onEndWithModifier: () => navigateToEnd(api, rowIndex, true),
                        onSelectColumn: () => selectColumn(api, column),
                        onSelectRow: () => selectRow(api, rowIndex),
                    },
                    { shouldPreventDefault: true, shouldStopPropagation: true },
                )(keyboardEvent);
            }

            // Handle drilling only if there are drillable items
            if (!onDrill || !drillableItems) {
                return;
            }

            // Drill via keyboard: ENTER or SPACE pressed on a drillable cell
            // Only drill if no modifier keys are pressed (to avoid conflicts with selection shortcuts)
            const hasModifiers =
                keyboardEvent.ctrlKey ||
                keyboardEvent.metaKey ||
                keyboardEvent.shiftKey ||
                keyboardEvent.altKey;

            if ((isEnterKey(keyboardEvent) || isSpaceKey(keyboardEvent)) && !hasModifiers) {
                drillFromCellEvent(event);
            }
        },
        [drillFromCellEvent, onDrill, drillableItems, navigateToHome, navigateToEnd, selectColumn, selectRow],
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

function getChartCoordinates(
    event:
        | CellClickedEvent<AgGridRowData, string | null, any>
        | CellKeyDownEvent<AgGridRowData, string | null, any>,
) {
    const id = event.api.getGridId();
    const found = event.eventPath?.find((x) => {
        return (x as HTMLElement).getAttribute("grid-id") === id;
    }) as HTMLElement | undefined;
    const boxParent = found?.getBoundingClientRect();
    const boxCell = (event.event?.target as HTMLElement | undefined)?.getBoundingClientRect();

    if (!boxParent || !boxCell) {
        return {
            chartX: undefined,
            chartY: undefined,
        };
    }

    const chartX = boxCell.x + boxCell.width / 2 - boxParent.x;
    const chartY = boxCell.y + boxCell.height / 2 - boxParent.y;

    return {
        chartX,
        chartY,
    };
}
