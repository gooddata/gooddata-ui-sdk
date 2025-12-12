// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useCurrentDataView } from "../context/CurrentDataViewContext.js";
import { type AgGridProps } from "../types/agGrid.js";

const AUTO_HEIGHT_THRESHOLD = 10;

/**
 * Returns ag-grid props with autoHeight applied based on execution size and totals.
 *
 * If execution has LESS OR EQUAL than 10 rows (experimentally chosen value) and totals are used,
 * sets autoHeight to "autoHeight". In all other cases, forces autoHeight to "normal".
 *
 * The value updates automatically when a new execution starts/finishes because it reacts
 * to changes of current data view and totals in props.
 *
 * @internal
 */
export function useAutoHeight(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { currentDataView } = useCurrentDataView();

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            const numberOfRows = currentDataView
                ? currentDataView.rawData().firstDimSize()
                : Number.POSITIVE_INFINITY;
            const hasTotalsDefined = currentDataView
                ? currentDataView.definition.dimensions.some(
                      (dimension) => (dimension.totals?.length ?? 0) > 0,
                  )
                : false;

            const shouldUseAutoHeight = hasTotalsDefined && numberOfRows <= AUTO_HEIGHT_THRESHOLD;

            return {
                ...agGridReactProps,
                domLayout: shouldUseAutoHeight ? "autoHeight" : "normal",
            };
        },
        [currentDataView],
    );
}
