// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { debounce } from "lodash-es";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { useCurrentDataView } from "../../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { usePivotTableSizing } from "../../context/PivotTableSizingContext.js";

interface IUseInitialAutoResizeVisibilityOptions {
    /**
     * Callback called once when visibility becomes ready.
     * Called directly from the effect, not during render.
     */
    onReady?: () => void;
}

// Pivoted tables take longer to complete resize.
const INITIAL_SETTLE_DEBOUNCE_PIVOTED_MS = 800;
const INITIAL_SETTLE_DEBOUNCE_MS = 400;

/**
 * Returns flag indicating whether the pivot table container is ready to be displayed without flicker.
 * For tables without autosizing, returns true immediately as no column width calculation is needed.
 *
 * @internal
 */
export function useInitialAutoResizeVisibility(options?: IUseInitialAutoResizeVisibilityOptions): boolean {
    const { agGridApi } = useAgGridApi();
    const { config, rows, columns } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();
    const { containerWidth, resizeOnShowCount } = usePivotTableSizing();
    const { growToFit, defaultWidth } = config.columnSizing;
    const [readyForPaint, setReadyForPaint] = useState(false);
    const onReadyCalledRef = useRef(false);
    const [previousResizeOnShowCount, setPreviousResizeOnShowCount] = useState(resizeOnShowCount);

    // Adjusted during render, not in the effect below, so React discards this commit before paint
    // instead of briefly showing stale readyForPaint=true alongside the columns being re-sized on show.
    if (resizeOnShowCount !== previousResizeOnShowCount) {
        setPreviousResizeOnShowCount(resizeOnShowCount);
        if (containerWidth > 0 && readyForPaint) {
            setReadyForPaint(false);
        }
    }

    useEffect(() => {
        const isCellSizing = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
        const isGridSizing = growToFit;
        const needsResize = isCellSizing || isGridSizing;
        const debounceTime =
            columns.length > 0 ? INITIAL_SETTLE_DEBOUNCE_PIVOTED_MS : INITIAL_SETTLE_DEBOUNCE_MS;

        if (!agGridApi || containerWidth <= 0) {
            return;
        }

        const markReady = () => {
            setReadyForPaint(true);
            if (options?.onReady && !onReadyCalledRef.current) {
                onReadyCalledRef.current = true;
                options.onReady();
            }
        };

        if (!needsResize || readyForPaint) {
            markReady();
            return;
        }

        const setIsReadyForPaint = debounce(() => {
            markReady();
        }, debounceTime);

        // Start debounce immediately - events will reset it if they fire
        // This ensures we eventually become ready even if no events fire
        setIsReadyForPaint();

        agGridApi.addEventListener("virtualColumnsChanged", setIsReadyForPaint);
        agGridApi.addEventListener("columnResized", setIsReadyForPaint);

        return () => {
            setIsReadyForPaint.cancel();
            agGridApi.removeEventListener("virtualColumnsChanged", setIsReadyForPaint);
            agGridApi.removeEventListener("columnResized", setIsReadyForPaint);
        };
    }, [
        agGridApi,
        defaultWidth,
        growToFit,
        readyForPaint,
        currentDataView,
        containerWidth,
        columns,
        rows,
        options,
    ]);

    return readyForPaint;
}
