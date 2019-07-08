// (C) 2019 GoodData Corporation

export const MAX_CHART_WIDTH = 340;

// https://github.com/highcharts/highcharts/blob/master/ts/parts/Chart.ts#
// Treemap: plotLeft = 10, marginRight = 10;
// Others: plotLeft = 0, marginRight = 0;
export const CHART_PADDING = 20;

// .gd-viz-tooltip-content => border: 1px solid transparentize($bubble-light-border-base, 0.3);
const TOOLTIP_BORDER = 1;

// .gd-viz-tooltip-content => padding: 13px 13px 9px;
const TOOLTIP_CONTENT_PADDING = 13;

export const TOOLTIP_PADDING =
    TOOLTIP_BORDER + TOOLTIP_CONTENT_PADDING + TOOLTIP_CONTENT_PADDING + TOOLTIP_BORDER;

export const TOOLTIP_COLUMN_NUMBER = 2;

// .gd-viz-tooltip-table-value => padding: 0 0 0 5px;
export const TOOLTIP_VALUE_PADDING = 5;
