// (C) 2025 GoodData Corporation

import { PAGE_SIZE } from "../../constants/internal.js";
import { type PivotTableNextConfig } from "../../types/public.js";

/**
 * Returns a valid page size for data fetching.
 * If the provided page size is not a positive number, returns the default PAGE_SIZE.
 *
 * @param pageSize - The page size to validate
 * @returns A positive page size suitable for data fetching
 * @internal
 */
export function getEffectivePageSize(pageSize: number): number {
    return pageSize > 0 ? pageSize : PAGE_SIZE;
}

/**
 * Checks if the page size represents "auto" mode.
 * Auto mode uses -1 as a sentinel value to let AG Grid determine the page size.
 *
 * @param pageSize - The page size to check
 * @returns true if auto mode is enabled
 * @internal
 */
export function isAutoPageSize(pageSize: number): boolean {
    return pageSize === -1;
}

/**
 * Checks if pagination is enabled based on the config.
 * Pagination requires both `config.pagination.enabled` and `config.enablePivotTablePagination` to be true,
 * OR accessibility mode to be enabled (which enforces pagination).
 *
 * @param config - The pivot table configuration
 * @returns true if pagination is fully enabled
 * @internal
 */
export function isPaginationEnabled(config: PivotTableNextConfig): boolean {
    const accessibilityEnabled = config.enableAccessibility ?? false;

    // Accessibility mode enforces pagination
    if (accessibilityEnabled) {
        return true;
    }

    const paginationConfigEnabled = config.pagination?.enabled ?? false;
    const paginationFeatureEnabled = config.enablePivotTablePagination === true;
    return paginationConfigEnabled && paginationFeatureEnabled;
}
