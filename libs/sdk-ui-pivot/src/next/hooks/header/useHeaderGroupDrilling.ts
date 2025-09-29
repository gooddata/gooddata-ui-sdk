// (C) 2025 GoodData Corporation

import { MouseEvent, useCallback, useMemo } from "react";

import { IDrillEvent, IDrillEventContextTable, VisualizationTypes } from "@gooddata/sdk-ui";

import { useCurrentDataView } from "../../context/CurrentDataViewContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { createCustomDrillEvent } from "../../features/drilling/events.js";
import { createHeaderDrillIntersection } from "../../features/drilling/intersection.js";
import { isHeaderCellDrillable } from "../../features/drilling/isDrillable.js";
import { AgGridColumnGroupDef, AgGridHeaderGroupParams } from "../../types/agGrid.js";

/**
 * Custom hook that provides header drilling functionality for group headers.
 * Returns a click handler that can be used for group header drilling.
 *
 * @param params - AgGrid header group parameters
 * @returns Object with header drilling functions
 * @internal
 */
export function useHeaderGroupDrilling(params: AgGridHeaderGroupParams) {
    const { drillableItems, onDrill, config } = usePivotTableProps();
    const { currentDataView } = useCurrentDataView();

    /**
     * Check if the header group is drillable (memoized)
     */
    const isDrillable = useMemo(() => {
        if (!drillableItems.length || !currentDataView) {
            return false;
        }

        const colGroupDef = params.columnGroup.getColGroupDef() as AgGridColumnGroupDef;
        return isHeaderCellDrillable(
            colGroupDef,
            drillableItems,
            currentDataView,
            config.columnHeadersPosition,
        );
    }, [drillableItems, currentDataView, params.columnGroup, config.columnHeadersPosition]);

    /**
     * Handle header group click for drilling
     */
    const handleHeaderDrill = useCallback(
        (event: MouseEvent) => {
            if (!onDrill || !isDrillable || !currentDataView) {
                return false;
            }

            const colGroupDef = params.columnGroup.getColGroupDef() as AgGridColumnGroupDef;
            const rowIndex = colGroupDef.headerGroupComponentParams?.pivotGroupDepth ?? -1;

            // Create drill context for header group
            const drillContext: IDrillEventContextTable = {
                type: VisualizationTypes.TABLE,
                element: "cell",
                columnIndex: colGroupDef.context?.columnDefinition.columnIndex ?? 0,
                rowIndex,
                row: [], // No row data for header
                intersection: createHeaderDrillIntersection(colGroupDef),
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
        [onDrill, isDrillable, params.columnGroup, currentDataView],
    );

    return {
        handleHeaderDrill,
        isDrillable,
    };
}
