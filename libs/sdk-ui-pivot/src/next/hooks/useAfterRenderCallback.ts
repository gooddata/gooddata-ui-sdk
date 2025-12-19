// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { type FirstDataRenderedEvent } from "ag-grid-enterprise";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { fixMissingRowgroupRoles } from "./useAccessibilityProps.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { useTableReady } from "../context/TableReadyContext.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Hook that consolidates all onFirstDataRendered handlers.
 *
 * This is the single source of truth for the onFirstDataRendered callback.
 * It handles:
 * - Notifying TableReadyContext for afterRender callback timing
 * - Fixing missing ARIA roles when accessibility mode is enabled
 *
 * @internal
 */
export function useAfterRenderCallback(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { afterRender, config } = usePivotTableProps();
    const { onFirstDataRendered: notifyFirstDataRendered } = useTableReady();

    const accessibilityEnabled = config.enableAccessibility ?? false;

    const handleFirstDataRendered = useCallback(
        (event: FirstDataRenderedEvent) => {
            // Notify table ready context for afterRender timing
            if (afterRender) {
                notifyFirstDataRendered();
            }

            // Fix missing ARIA roles when accessibility mode is enabled
            if (accessibilityEnabled) {
                fixMissingRowgroupRoles(event);
            }
        },
        [afterRender, accessibilityEnabled, notifyFirstDataRendered],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            // Only set onFirstDataRendered if we have something to do
            if (!afterRender && !accessibilityEnabled) {
                return agGridReactProps;
            }

            if (agGridReactProps.onFirstDataRendered) {
                throw new UnexpectedSdkError("onFirstDataRendered is already set");
            }

            return {
                ...agGridReactProps,
                onFirstDataRendered: handleFirstDataRendered,
            };
        },
        [afterRender, accessibilityEnabled, handleFirstDataRendered],
    );
}
