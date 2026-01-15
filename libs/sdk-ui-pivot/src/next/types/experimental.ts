// (C) 2025-2026 GoodData Corporation

/**
 * Configuration for pivot table experimental features.
 *
 * @public
 */
export type PivotTableNextExperimentalConfig = {
    /**
     * Enable automatic reset of column sizing when container width changes or column structure changes.
     * This fixes issues where tables with growToFit don't expand to full width after tab switching.
     *
     * Default: true
     */
    enablePivotTableAutoSizeReset?: boolean;

    /**
     * Enable pagination for the pivot table.
     *
     * Default: true
     */
    enablePivotTablePagination?: boolean;
};
