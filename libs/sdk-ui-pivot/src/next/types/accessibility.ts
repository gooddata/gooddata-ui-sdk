// (C) 2025 GoodData Corporation

/**
 * Accessibility-related configuration for the PivotTableNext component.
 *
 * @public
 */
export interface PivotTableNextAccessibilityConfig {
    /**
     * Enable accessibility mode optimizations.
     *
     * @remarks
     * When enabled, the following optimizations are applied:
     * - Row and column virtualization is disabled for proper DOM order
     * - Grand totals are positioned at bottom/top based on pinnedTop/pinnedBottom config for proper reading order
     * - Pagination is enforced
     *
     * Default: false
     */
    enableAccessibility?: boolean;
}
