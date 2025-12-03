// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { FirstDataRenderedEvent } from "ag-grid-enterprise";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { useTableReady } from "../context/TableReadyContext.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Hook that provides proper afterRender callback timing.
 *
 * Notifies TableReadyContext when ag-grid first renders data.
 * The actual afterRender callback is called by the context
 * when both firstDataRendered AND visibility are ready.
 *
 * @internal
 */
export function useAfterRenderCallback(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { afterRender } = usePivotTableProps();
    const { onFirstDataRendered: notifyFirstDataRendered } = useTableReady();

    const handleFirstDataRendered = useCallback(
        (_event: FirstDataRenderedEvent) => {
            notifyFirstDataRendered();
        },
        [notifyFirstDataRendered],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (!afterRender) {
                return agGridReactProps;
            }

            if (agGridReactProps.onFirstDataRendered) {
                throw new UnexpectedSdkError("onFirstDataRendered is already set");
            }

            return {
                ...agGridReactProps,
                onFirstDataRendered: (event: FirstDataRenderedEvent) => {
                    agGridReactProps.onFirstDataRendered?.(event);
                    handleFirstDataRendered(event);
                },
            };
        },
        [afterRender, handleFirstDataRendered],
    );
}
