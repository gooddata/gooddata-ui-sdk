// (C) 2025 GoodData Corporation

/**
 * Configuration for pivot table experimental features.
 *
 * @alpha
 */
export interface PivotTableNextExperimentalConfig {
    /**
     * Enable automatic reset of column sizing when container width changes or column structure changes.
     * This fixes issues where tables with growToFit don't expand to full width after tab switching.
     *
     * @alpha
     */
    enablePivotTableAutoSizeReset?: boolean;
}
