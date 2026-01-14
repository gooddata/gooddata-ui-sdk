// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { usePivotTableProps } from "../context/PivotTablePropsContext.js";
import { isAutoPageSize, isPaginationEnabled } from "../features/pagination/utils.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props for pagination configuration.
 *
 * @remarks
 * Pagination is only enabled if config.pagination.enabled is true and config.enablePivotTablePagination is not false.
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
                };
            },
        [config, pageSize],
    );
}
