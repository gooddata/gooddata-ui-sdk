// (C) 2025 GoodData Corporation

import { useEffect, useState } from "react";

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

    useEffect(() => {
        const isCellSizing = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
        const isGridSizing = growToFit;
        const needsResize = isCellSizing || isGridSizing;
        const debounceTime = columns.length > 0 ? 800 : 400; // Pivoted tables takes longer time to complete resize

        if (!agGridApi) {
            return;
        }

        if (!needsResize || readyForPaint) {
            setReadyForPaint(true);
            return;
        }

        const setIsReadyForPaint = debounce(() => {
            setReadyForPaint(true);
        }, debounceTime);

        agGridApi.addEventListener("virtualColumnsChanged", setIsReadyForPaint);
        agGridApi.addEventListener("columnResized", setIsReadyForPaint);

        return () => {
            agGridApi.removeEventListener("virtualColumnsChanged", setIsReadyForPaint);
            agGridApi.removeEventListener("columnResized", setIsReadyForPaint);
        };
    }, [agGridApi, defaultWidth, growToFit, readyForPaint, currentDataView, columns, rows]);

    return readyForPaint;
}
