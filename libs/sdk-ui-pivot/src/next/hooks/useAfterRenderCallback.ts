// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { type FirstDataRenderedEvent } from "ag-grid-enterprise";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { fixRowgroupRoles } from "./useAccessibilityProps.js";
import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { useTableReady } from "../context/TableReadyContext.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Hook that consolidates all onFirstDataRendered handlers.
 *
 * This is the single source of truth for the onFirstDataRendered callback.
 * It handles:
 * - Notifying TableReadyContext for afterRender callback timing
 * - Fixing ARIA roles for proper accessibility
 *
 * @internal
 */
export function useAfterRenderCallback(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { afterRender } = usePivotTableProps();
    const { onFirstDataRendered: notifyFirstDataRendered } = useTableReady();

    const handleFirstDataRendered = useCallback(
        (event: FirstDataRenderedEvent) => {
            // Notify table ready context for afterRender timing
            if (afterRender) {
                notifyFirstDataRendered();
            }

            // Fix ARIA roles for proper accessibility
            fixRowgroupRoles(event);
        },
        [afterRender, notifyFirstDataRendered],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.onFirstDataRendered) {
                throw new UnexpectedSdkError("onFirstDataRendered is already set");
            }

            return {
                ...agGridReactProps,
                onFirstDataRendered: handleFirstDataRendered,
            };
        },
        [handleFirstDataRendered],
    );
}
