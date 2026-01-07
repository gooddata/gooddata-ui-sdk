// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import type { FirstDataRenderedEvent } from "ag-grid-enterprise";

import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Selectors for AG Grid containers that may need rowgroup role adjustment.
 * These containers either have rowgroup without rows or are missing rowgroup with rows.
 */
const ROWGROUP_CONTAINER_SELECTORS = [
    ".ag-full-width-container",
    ".ag-viewport.ag-sticky-top-viewport",
    ".ag-sticky-top-full-width-container",
    ".ag-floating-bottom-full-width-container",
].join(", ");

/**
 * Fix AG Grid containers by adjusting the role="rowgroup" attribute.
 *
 * ARIA spec requires rowgroup to contain at least one row element.
 * This function:
 * - Adds rowgroup role to containers that have row children
 * - Removes rowgroup role from empty containers
 *
 * @internal
 */
export function fixRowgroupRoles(event: FirstDataRenderedEvent): void {
    const gridId = event.api.getGridId();
    const gridContainer = document.querySelector(`[grid-id="${gridId}"]`);
    if (!gridContainer) {
        return;
    }

    gridContainer.querySelectorAll(ROWGROUP_CONTAINER_SELECTORS).forEach((el: Element) => {
        const hasRowChildren = el.querySelector("[role='row']") !== null;
        if (hasRowChildren) {
            el.setAttribute("role", "rowgroup");
        } else {
            el.removeAttribute("role");
        }
    });
}

/**
 * Hook that applies accessibility mode overrides to the config.
 *
 * @remarks
 * When accessibility mode is enabled, certain config values are overridden
 * to ensure proper accessibility behavior:
 * - grandTotalsPosition is converted from pinnedTop/pinnedBottom to top/bottom for proper reading order
 * - pagination is enforced
 *
 * @internal
 */
export function useAccessibilityConfigOverrides(): {
    grandTotalsPosition: "pinnedBottom" | "pinnedTop" | "bottom" | "top";
} {
    const { config } = usePivotTableProps();

    const accessibilityEnabled = config.enableAccessibility ?? false;
    const configuredPosition = config.grandTotalsPosition ?? "pinnedBottom";

    const grandTotalsPosition = useMemo(() => {
        if (!accessibilityEnabled) {
            return configuredPosition;
        }

        // In accessibility mode, convert pinned positions to non-pinned for proper reading order
        if (configuredPosition === "pinnedBottom") {
            return "bottom";
        }
        if (configuredPosition === "pinnedTop") {
            return "top";
        }

        return configuredPosition;
    }, [accessibilityEnabled, configuredPosition]);

    return { grandTotalsPosition };
}

/**
 * Hook that provides AG Grid props for accessibility mode.
 *
 * @remarks
 * When accessibility mode is enabled, row and column virtualization are disabled
 * to ensure proper DOM order for screen readers and assistive technologies.
 *
 * Disabling virtualization means all rows and columns are rendered in the DOM,
 * which improves screen reader navigation but may impact performance for large datasets.
 * This is why pagination is typically used together with accessibility mode.
 *
 *
 * @internal
 */
export function useAccessibilityModeProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { config } = usePivotTableProps();

    const accessibilityEnabled = config.enableAccessibility ?? false;

    return useCallback(
        (agGridReactProps: AgGridProps): AgGridProps => {
            if (!accessibilityEnabled) {
                return agGridReactProps;
            }

            return {
                ...agGridReactProps,
                // Disable virtualization for accessibility mode to ensure all content
                // is in the DOM for screen readers and assistive technologies
                suppressColumnVirtualisation: true,
                suppressRowVirtualisation: true,
            };
        },
        [accessibilityEnabled],
    );
}
