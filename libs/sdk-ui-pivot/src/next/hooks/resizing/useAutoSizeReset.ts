// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";

const CONTAINER_WIDTH_CHANGE_THRESHOLD_PX = 50;
const RESIZE_TOLERANCE_PX = 10;

export interface IAutoSizeResetResult {
    /**
     * Whether the new auto-size reset behavior is enabled
     */
    enablePivotTableAutoSizeReset: boolean;
    /**
     * Check if resize should be skipped based on current state
     */
    shouldSkipResize: (allColumnsWidth: number, containerWidth: number) => boolean;
    /**
     * Mark table as initialized if appropriate based on feature flag
     */
    markAsInitializedIfNeeded: (allColumnsWidth: number, containerWidth: number) => void;
}

/**
 * Hook that resets autoSizeInitialized when column structure changes (always)
 * and optionally when container width changes significantly (controlled by flag).
 * This ensures tables re-resize correctly after tab switching, browser resize,
 * sorting, adding totals, switching from view mode to edit mode, etc.
 *
 * @internal
 */
export function useAutoSizeReset(): IAutoSizeResetResult {
    const { config } = usePivotTableProps();
    const { containerWidth, autoSizeInitialized, setAutoSizeInitialized } = useAgGridApi();
    const { columnDefsFlat } = useColumnDefs();

    const enablePivotTableAutoSizeReset = config.enablePivotTableAutoSizeReset ?? true;
    const prevContainerWidthRef = useRef(containerWidth);

    // Always reset when column structure changes (original behavior)
    // Skip if new behavior is enabled (it will be handled by columnDefsFlat dependency in the second effect)
    useEffect(() => {
        if (enablePivotTableAutoSizeReset) {
            return;
        }

        setAutoSizeInitialized(false);
    }, [columnDefsFlat, setAutoSizeInitialized, enablePivotTableAutoSizeReset]);

    // Reset when container width changes significantly OR column structure changes (new behavior, controlled by flag)
    useEffect(() => {
        if (!enablePivotTableAutoSizeReset) {
            return;
        }

        const widthDelta = Math.abs(containerWidth - prevContainerWidthRef.current);
        const containerWidthChanged = widthDelta > CONTAINER_WIDTH_CHANGE_THRESHOLD_PX;

        if (containerWidthChanged) {
            prevContainerWidthRef.current = containerWidth;
        }

        // Reset on either container width change or column structure change
        if (containerWidthChanged || columnDefsFlat) {
            setAutoSizeInitialized(false);
        }
    }, [containerWidth, columnDefsFlat, setAutoSizeInitialized, enablePivotTableAutoSizeReset]);

    const shouldSkipResize = (allColumnsWidth: number, containerWidth: number): boolean => {
        const needsResize = allColumnsWidth < containerWidth - RESIZE_TOLERANCE_PX;
        return enablePivotTableAutoSizeReset ? autoSizeInitialized && !needsResize : autoSizeInitialized;
    };

    const markAsInitializedIfNeeded = (allColumnsWidth: number, containerWidth: number): void => {
        const needsResize = allColumnsWidth < containerWidth - RESIZE_TOLERANCE_PX;
        const shouldMarkInitialized = !enablePivotTableAutoSizeReset || !needsResize;
        if (shouldMarkInitialized) {
            setAutoSizeInitialized(true);
        }
    };

    return {
        enablePivotTableAutoSizeReset,
        shouldSkipResize,
        markAsInitializedIfNeeded,
    };
}
