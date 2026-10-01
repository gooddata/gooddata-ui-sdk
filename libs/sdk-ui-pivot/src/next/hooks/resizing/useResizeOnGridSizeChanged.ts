// (C) 2026 GoodData Corporation

import { type RefObject, useCallback, useEffect, useRef } from "react";

import { type FirstDataRenderedEvent, type GridSizeChangedEvent } from "ag-grid-enterprise";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { usePivotTableSizingActions } from "../../context/PivotTableSizingContext.js";
import {
    agGridAutoSizeAllColumns,
    agGridAutosizeColumnsToFit,
} from "../../features/resizing/agGridColumnSizingApi.js";
import {
    getColumnsPendingAutoResize,
    getColumnsWithinViewport,
} from "../../features/resizing/getColumnsPendingAutoResize.js";
import { type AgGridApi, type AgGridProps } from "../../types/agGrid.js";
import { type IGridSizingState } from "../../types/internal.js";

/**
 * Returns ag-grid props enhanced with a `gridSizeChanged` handler that keeps `PivotTableSizingContext`'s
 * `containerWidth` in sync with the grid width, and applies growToFit sizing when the grid's container
 * transitions from zero to a positive width (e.g. an inactive Visualization Switcher tab becoming active)
 * while this grid instance has not been sized at a positive width yet, retrying once first data renders
 * if needed. Once sized, flex columns follow the container width on their own, so later re-shows skip it.
 * It signals `markResizeOnShow` whenever such a re-show triggers a resize, either growToFit sizing here or
 * virtual column auto-resize of columns that come into view unsized.
 *
 * @internal
 */
export function useResizeOnGridSizeChanged(
    processedColumnsRef: RefObject<Set<string>>,
    gridSizingStateRef: RefObject<IGridSizingState>,
): (agGridReactProps: AgGridProps) => AgGridProps {
    const { config } = usePivotTableProps();
    const { setContainerWidth, markResizeOnShow } = usePivotTableSizingActions();
    const { growToFit, defaultWidth } = config.columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";

    const lastWidthRef = useRef<number | null>(null);
    const cancelPendingRetryRef = useRef<(() => void) | null>(null);

    const applyGrowToFit = useCallback(
        (api: AgGridApi) => {
            if (shouldAdaptSizeToCellContent) {
                agGridAutoSizeAllColumns(api);
            } else {
                agGridAutosizeColumnsToFit(api);
            }
        },
        [shouldAdaptSizeToCellContent],
    );

    const handleGridSizeChanged = useCallback(
        (event: GridSizeChangedEvent) => {
            const previousWidth = lastWidthRef.current;
            lastWidthRef.current = event.clientWidth;

            if (previousWidth !== event.clientWidth) {
                setContainerWidth(event.clientWidth);
            }

            const becameHidden = previousWidth !== null && previousWidth > 0 && event.clientWidth <= 0;
            const becameVisible = previousWidth === 0 && event.clientWidth > 0;
            if (becameHidden || becameVisible) {
                cancelPendingRetryRef.current?.();
                cancelPendingRetryRef.current = null;
            }

            if (!becameVisible) {
                return;
            }

            if (!growToFit || gridSizingStateRef.current.isSized) {
                if (
                    shouldAdaptSizeToCellContent &&
                    getColumnsPendingAutoResize(
                        getColumnsWithinViewport(event.api, event.clientWidth),
                        processedColumnsRef.current,
                    ).length > 0
                ) {
                    markResizeOnShow();
                }
                return;
            }

            markResizeOnShow();

            if (!gridSizingStateRef.current.hasRenderedFirstData) {
                const api = event.api;
                const retry = () => {
                    api.removeEventListener("firstDataRendered", retry);
                    cancelPendingRetryRef.current = null;
                    applyGrowToFit(api);
                };
                api.addEventListener("firstDataRendered", retry);
                cancelPendingRetryRef.current = () => api.removeEventListener("firstDataRendered", retry);
                return;
            }

            applyGrowToFit(event.api);
        },
        [
            growToFit,
            shouldAdaptSizeToCellContent,
            setContainerWidth,
            markResizeOnShow,
            applyGrowToFit,
            processedColumnsRef,
            gridSizingStateRef,
        ],
    );

    useEffect(() => {
        return () => {
            cancelPendingRetryRef.current?.();
            cancelPendingRetryRef.current = null;
        };
    }, [handleGridSizeChanged]);

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            return {
                ...agGridReactProps,
                onGridSizeChanged: (event: GridSizeChangedEvent) => {
                    agGridReactProps.onGridSizeChanged?.(event);
                    handleGridSizeChanged(event);
                },
                onFirstDataRendered: (event: FirstDataRenderedEvent) => {
                    gridSizingStateRef.current.hasRenderedFirstData = true;
                    agGridReactProps.onFirstDataRendered?.(event);
                },
            };
        },
        [handleGridSizeChanged, gridSizingStateRef],
    );
}
