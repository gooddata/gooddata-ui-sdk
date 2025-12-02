// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";

/**
 * Refreshes ag-grid cells when drillableItems change.
 * Since drillableItems are now accessed via ref in column closures,
 * we need to trigger a cell refresh so ag-grid re-evaluates cellClass.
 *
 * @internal
 */
export function useSyncDrillableItems() {
    const { drillableItems } = usePivotTableProps();
    const { agGridApi } = useAgGridApi();
    const prevDrillableItems = useRef(drillableItems);

    useEffect(() => {
        // Only refresh if drillableItems actually changed (not just agGridApi becoming available)
        const drillableItemsChanged = prevDrillableItems.current !== drillableItems;
        prevDrillableItems.current = drillableItems;

        if (drillableItemsChanged && agGridApi) {
            // Refresh cells to re-evaluate cellClass with new drillableItems from ref
            // force: true bypasses AG Grid's change detection (needed because cell values haven't changed)
            agGridApi.refreshCells({ force: true });
        }
    }, [drillableItems, agGridApi]);
}
