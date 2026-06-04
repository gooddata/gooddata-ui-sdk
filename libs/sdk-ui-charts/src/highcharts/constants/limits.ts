// (C) 2007-2026 GoodData Corporation

export const DEFAULT_SERIES_LIMIT = 10000;
export const DEFAULT_CATEGORIES_LIMIT = 10000;
export const DEFAULT_DATA_POINTS_LIMIT = 10000;
export const PIE_CHART_LIMIT = 10000;
export const HEATMAP_DATA_POINTS_LIMIT = 10000;
export const SANKEY_CHART_NODE_LIMIT = 10000;
export const SANKEY_CHART_DATA_POINT_LIMIT = 10000;
export const WATERFALL_CHART_DATA_POINT_LIMIT = 10000;
// Stacked column/bar charts freeze the main thread well before the generic 10k series cap
// (Highcharts can't draw more than ~1500 stacks), so they need a tighter limit than other chart types.
export const STACKED_COLUMN_BAR_SERIES_LIMIT = 1000;
// Column/bar charts render one SVG element per data point, and the point count is categories x series.
// That total can hang the browser even when neither dimension alone hits its cap, so cap the total too.
export const COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT = 6000;

/**
 * Soft limits are used for checking whether the chart should be recommended to be filtered out
 * due to too many data points.
 *
 * Values of soft limits used to be hard limits of the UI. They were changed to soft limits
 * and hard limits are now set to disable the charts when backend limits are still not hit.
 */
export const SOFT_DEFAULT_SERIES_LIMIT = 1000;
export const SOFT_DEFAULT_CATEGORIES_LIMIT = 3000;
export const SOFT_DEFAULT_DATA_POINTS_LIMIT = 2000;
export const SOFT_PIE_CHART_LIMIT = 20;
export const SOFT_SANKEY_CHART_NODE_LIMIT = 50;
export const SOFT_SANKEY_CHART_DATA_POINT_LIMIT = 500;
export const SOFT_WATERFALL_CHART_DATA_POINT_LIMIT = 400;
export const SOFT_STACKED_COLUMN_BAR_SERIES_LIMIT = 50;
export const SOFT_COLUMN_BAR_TOTAL_DATA_POINTS_LIMIT = 2000;
