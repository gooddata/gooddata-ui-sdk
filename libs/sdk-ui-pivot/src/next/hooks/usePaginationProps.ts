// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { isAutoPageSize, isPaginationEnabled } from "../features/pagination/utils.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props for pagination configuration.
 *
 * @remarks
 * When pagination is enabled, row and column virtualization are disabled, which could lead to performance issues.
 * Pagination is only enabled if both config.pagination.enabled AND config.enablePivotTablePagination are true.
 *
 * @internal
 */
export function usePaginationProps() {
    const { config, pageSize } = usePivotTableProps();

    return useMemo(
        () =>
            (props: AgGridProps): AgGridProps => {
                const paginationEnabled = isPaginationEnabled(config);
                const autoPageSize = isAutoPageSize(pageSize);

                return {
                    ...props,
                    pagination: paginationEnabled,
                    paginationPageSize: paginationEnabled ? (autoPageSize ? undefined : pageSize) : undefined,
                    paginationAutoPageSize: paginationEnabled ? autoPageSize : undefined,
                    // Disable virtualization when pagination is enabled to ensure proper rendering
                    suppressColumnVirtualisation: paginationEnabled,
                    suppressRowVirtualisation: paginationEnabled,
                };
            },
        [config, pageSize],
    );
}
