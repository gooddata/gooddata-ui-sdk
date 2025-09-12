// (C) 2025 GoodData Corporation

import { useCallback, useRef } from "react";

import { FirstDataRenderedEvent } from "ag-grid-enterprise";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Hook that provides proper afterRender callback timing.
 *
 * Calls afterRender once per execution when ag-grid first renders data.
 *
 * @internal
 */
export function useAfterRenderCallback(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { afterRender, execution } = usePivotTableProps();
    const lastAfterRenderExecutionRef = useRef<string>();

    const onFirstDataRendered = useCallback(
        (_event: FirstDataRenderedEvent) => {
            const currentFingerprint = execution.fingerprint();

            // Only call afterRender once per execution change
            if (lastAfterRenderExecutionRef.current !== currentFingerprint && afterRender) {
                lastAfterRenderExecutionRef.current = currentFingerprint;
                afterRender();
            }
        },
        [afterRender, execution],
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
                    onFirstDataRendered(event);
                },
            };
        },
        [afterRender, onFirstDataRendered],
    );
}
