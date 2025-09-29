// (C) 2025 GoodData Corporation

import { MouseEvent, useCallback, useMemo } from "react";

import {
    IDrillEvent,
    IDrillEventContextTable,
    VisualizationTypes,
    isValueColumnDefinition,
} from "@gooddata/sdk-ui";

import { useCurrentDataView } from "../../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { createCustomDrillEvent } from "../../features/drilling/events.js";
import { createHeaderDrillIntersection } from "../../features/drilling/intersection.js";
import { isHeaderCellDrillable } from "../../features/drilling/isDrillable.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Custom hook that provides header drilling functionality.
 * Returns a click handler that can be used alongside sorting functionality.
 *
 * @param params - AgGrid header parameters
 * @returns Object with header drilling functions
 * @internal
 */
export function useHeaderDrilling(params: AgGridHeaderParams | null) {
    const { drillableItems, onDrill, config } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();

    /**
     * Check if the header cell is drillable (memoized)
     */
    const isDrillable = useMemo(() => {
        if (!drillableItems.length || !currentDataView || !params) {
            return false;
        }

        const colDef = params.column.getColDef() as AgGridColumnDef;
        return isHeaderCellDrillable(colDef, drillableItems, currentDataView, config.columnHeadersPosition);
    }, [drillableItems, currentDataView, params, config.columnHeadersPosition]);

    /**
     * Handle header click for drilling
     * This function should be called after sorting logic to avoid interference
     */
    const handleHeaderDrill = useCallback(
        (event: MouseEvent) => {
            if (!onDrill || !isDrillable || !currentDataView || !params) {
                return false;
            }

            const colDef = params.column.getColDef() as AgGridColumnDef;
            const columnDefinition = colDef.context?.columnDefinition;
            const rowIndex = isValueColumnDefinition(columnDefinition)
                ? columnDefinition.columnScope.length - 1
                : -1;

            // Create drill context for header
            const drillContext: IDrillEventContextTable = {
                type: VisualizationTypes.TABLE,
                element: "cell",
                columnIndex: colDef.context?.columnDefinition.columnIndex ?? 0,
                rowIndex,
                row: [], // No row data for header
                intersection: createHeaderDrillIntersection(colDef),
            };

            // Create drill event
            const drillEvent: IDrillEvent = {
                dataView: currentDataView.dataView,
                drillContext,
            };

            if (onDrill(drillEvent)) {
                const customEvent = createCustomDrillEvent(drillEvent);
                event.target?.dispatchEvent(customEvent);
                return true;
            }

            return false;
        },
        [onDrill, isDrillable, params, currentDataView],
    );

    return params
        ? {
              handleHeaderDrill,
              isDrillable,
          }
        : {
              handleHeaderDrill: () => {},
              isDrillable: false,
          };
}
