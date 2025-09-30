// (C) 2025 GoodData Corporation

import { useCallback, useRef } from "react";

import { GridApi, VirtualColumnsChangedEvent } from "ag-grid-enterprise";
import { debounce } from "lodash-es";

import { usePrevious } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridColumn, AgGridOnVirtualColumnsChanged, AgGridProps } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";

/**
 * Returns ag-grid props with virtual column auto resize applied.
 *
 * With column virtualization, not all columns are rendered in DOM.
 * This hook basically simulates "onHorizontalScroll" resizing so that new columns that were not visible
 * before are resized to fit their content or prescribed width.
 *
 * @internal
 */
export function useVirtualColumnAutoResize(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { config } = usePivotTableProps();
    const { columnSizing, columnHeadersPosition } = config;
    const { defaultWidth } = columnSizing;

    const shouldAutoResizeDisplayedColumns = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";

    const processedColumnsRef = useRef<Set<string>>(new Set());

    const previousColumnHeadersPosition = usePrevious(columnHeadersPosition);

    // Avoid skipping columns autosize on column headers position change
    if (columnHeadersPosition !== previousColumnHeadersPosition) {
        processedColumnsRef.current = new Set();
    }

    const debouncedAutoSize = useRef(
        debounce((api: GridApi<AgGridRowData>, columns: AgGridColumn[]) => {
            if (columns.length > 0) {
                // Only auto-size columns that haven't been processed yet, help with lagging a bit
                // Also skip columns that have a width set as it may be fixed by column config
                const newColumns = columns.filter(
                    (col) =>
                        !processedColumnsRef.current.has(col.getId()) &&
                        (col.getColDef().width === undefined || col.getColDef().width === null),
                );
                if (newColumns.length > 0) {
                    api.autoSizeColumns(newColumns, false);
                    // Mark columns as processed
                    newColumns.forEach((col) => processedColumnsRef.current.add(col.getId()));
                }
            }
        }, 50),
    ).current;

    const onVirtualColumnsChanged = useCallback<AgGridOnVirtualColumnsChanged>(
        (event) => {
            if (!shouldAutoResizeDisplayedColumns) {
                return;
            }

            const displayedColumns = event.api.getAllDisplayedVirtualColumns();
            debouncedAutoSize(event.api, displayedColumns);
        },
        [shouldAutoResizeDisplayedColumns, debouncedAutoSize],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (!shouldAutoResizeDisplayedColumns) {
                return agGridReactProps;
            }

            return {
                ...agGridReactProps,
                onVirtualColumnsChanged: (event: VirtualColumnsChangedEvent) => {
                    agGridReactProps.onVirtualColumnsChanged?.(event);
                    onVirtualColumnsChanged(event);
                },
            };
        },
        [shouldAutoResizeDisplayedColumns, onVirtualColumnsChanged],
    );
}
