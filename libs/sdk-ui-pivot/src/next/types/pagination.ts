// (C) 2025 GoodData Corporation

/**
 * Pagination settings for the PivotTableNext component.
 *
 * @public
 */
export interface IPagination {
    /**
     * Enable pagination for the table.
     *
     * @remarks
     * When enabled, the table will display rows in pages with pagination controls.
     * The page size is determined by the component's `pageSize` prop.
     *
     * Default: false
     */
    enabled?: boolean;
}

/**
 * Pagination-related configuration for the PivotTableNext component.
 *
 * @public
 */
export interface PivotTableNextPaginationConfig {
    /**
     * Pagination settings.
     */
    pagination?: IPagination;
}
