// (C) 2025-2026 GoodData Corporation

/**
 * Position of grand totals rows in the table.
 *
 * - "pinnedBottom" - Grand totals are pinned at the bottom of the table (always visible)
 * - "pinnedTop" - Grand totals are pinned at the top of the table (always visible)
 * - "bottom" - Grand totals appear at the end of the table data (scrolls with content)
 * - "top" - Grand totals appear at the beginning of the table data (scrolls with content)
 *
 * @public
 */
export type GrandTotalsPosition = "pinnedBottom" | "pinnedTop" | "bottom" | "top";

/**
 * Configuration for grand totals row positioning in the pivot table.
 *
 * @public
 */
export type PivotTableNextGrandTotalsPositionConfig = {
    /**
     * Position of grand totals rows in the table.
     *
     * - "pinnedBottom" - Grand totals are pinned at the bottom (always visible while scrolling)
     * - "pinnedTop" - Grand totals are pinned at the top (always visible while scrolling)
     * - "bottom" - Grand totals appear at the end of the table data (scrolls with content)
     * - "top" - Grand totals appear at the beginning of the table data (scrolls with content)
     *
     * Default value: "pinnedBottom"
     */
    grandTotalsPosition?: GrandTotalsPosition;
};
