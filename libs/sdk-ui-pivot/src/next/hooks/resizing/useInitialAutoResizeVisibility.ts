// (C) 2025 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { debounce } from "lodash-es";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { useCurrentDataView } from "../../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";

/**
 * Returns flag indicating whether the pivot table container is ready to be displayed without flicker.
 * For tables without autosizing, returns true immediately as no column width calculation is needed.
 *
 * @internal
 */
export function useInitialAutoResizeVisibility(): boolean {
    const { agGridApi } = useAgGridApi();
    const { config, rows, columns } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();
    const { growToFit, defaultWidth } = config.columnSizing;
    const [readyForPaint, setReadyForPaint] = useState(false);
    const readyForPaintRef = useRef(false);

    useEffect(() => {
        const isCellSizing = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
        const isGridSizing = growToFit;
        const needsResize = isCellSizing || isGridSizing;
        const debounceTime = columns.length > 0 ? 800 : 400; // Pivoted tables takes longer time to complete resize

        if (!agGridApi) {
            return;
        }

        // If no resizing is needed, mark as ready immediately
        if (!needsResize) {
            if (!readyForPaintRef.current) {
                readyForPaintRef.current = true;
                setReadyForPaint(true);
            }
            return;
        }

        // If already ready, don't set up listeners again
        if (readyForPaintRef.current) {
            return;
        }

        const setIsReadyForPaint = debounce(() => {
            readyForPaintRef.current = true;
            setReadyForPaint(true);
        }, debounceTime);

        // Listen to resize events for optimal timing
        agGridApi.addEventListener("virtualColumnsChanged", setIsReadyForPaint);
        agGridApi.addEventListener("columnResized", setIsReadyForPaint);
        // Fallback: Listen to firstDataRendered to ensure table becomes visible
        // even if resize events don't fire (e.g., empty table, small data)
        agGridApi.addEventListener("firstDataRendered", setIsReadyForPaint);

        return () => {
            agGridApi.removeEventListener("virtualColumnsChanged", setIsReadyForPaint);
            agGridApi.removeEventListener("columnResized", setIsReadyForPaint);
            agGridApi.removeEventListener("firstDataRendered", setIsReadyForPaint);
            setIsReadyForPaint.cancel();
        };
    }, [agGridApi, defaultWidth, growToFit, currentDataView, columns, rows]);

    return readyForPaint;
}
