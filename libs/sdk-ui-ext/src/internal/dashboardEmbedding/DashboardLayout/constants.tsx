// (C) 2007-2020 GoodData Corporation
import { Configuration } from "react-grid-system";
import {
    DashboardViewLayoutWidgetClass,
    DashboardViewWidgetDimensionsByWidgetClass,
    IDashboardViewWidgetDimension,
} from "./interfaces/dashboardLayoutSizing";

// Breakpoints
export const SCREEN_BREAKPOINT_XS = 320;
export const SCREEN_BREAKPOINT_SM = 640;
export const SCREEN_BREAKPOINT_MD = 940;
export const SCREEN_BREAKPOINT_LG = 1170;
export const SCREEN_BREAKPOINT_XL = 1590;
export const SCREEN_BREAKPOINT_XXL = 99999999;

// Grid configuration
export const DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT = 12;

export const DASHBOARD_LAYOUT_GUTTER_WIDTH = 0;

export const DASHBOARD_LAYOUT_BREAKPOINT_XS = SCREEN_BREAKPOINT_XS + 1;
export const DASHBOARD_LAYOUT_BREAKPOINT_SM = SCREEN_BREAKPOINT_SM + 1;
export const DASHBOARD_LAYOUT_BREAKPOINT_MD = SCREEN_BREAKPOINT_LG + 1;
export const DASHBOARD_LAYOUT_BREAKPOINT_LG = SCREEN_BREAKPOINT_XL + 1;

export const DASHBOARD_LAYOUT_BREAK_POINTS: number[] = [
    DASHBOARD_LAYOUT_BREAKPOINT_XS,
    DASHBOARD_LAYOUT_BREAKPOINT_SM,
    DASHBOARD_LAYOUT_BREAKPOINT_MD,
    DASHBOARD_LAYOUT_BREAKPOINT_LG,
];

export const DASHBOARD_LAYOUT_GRID_CONFIGURATION: Configuration = {
    // https://github.com/sealninja/react-grid-system#%EF%B8%8F-upgrading-to-v7
    maxScreenClass: "xl",
    defaultScreenClass: undefined,
    gutterWidth: DASHBOARD_LAYOUT_GUTTER_WIDTH,
    breakpoints: DASHBOARD_LAYOUT_BREAK_POINTS,
};

// Default widget sizes
const DASHBOARD_LAYOUT_PADDING = 8;

// measured from '.s-fluid-layout-container' element
export const DASHBOARD_LAYOUT_CONTAINER_WIDTHS = {
    xs: 310 - DASHBOARD_LAYOUT_PADDING, // measured at SCREEN_BREAKPOINT_XS
    sm: 630 - DASHBOARD_LAYOUT_PADDING, // measured at SCREEN_BREAKPOINT_SM
    md: 980 - DASHBOARD_LAYOUT_PADDING, // measured at SCREEN_BREAKPOINT_LG
    lg: 1330 - DASHBOARD_LAYOUT_PADDING, // measured at SCREEN_BREAKPOINT_XL
    xl: 1660 - DASHBOARD_LAYOUT_PADDING, // measured at empirically derived value 1920
};

export const DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH = 180;

// TODO: RAIL-2869 unmix visualization classes & kpi?
export const DASHBOARD_LAYOUT_WIDGET_CLASS: {
    [widgetClass in DashboardViewLayoutWidgetClass]?: DashboardViewLayoutWidgetClass;
} = {
    kpi: "kpi",
    headline: "headline",
    xirr: "xirr",
    column: "column",
    bar: "bar",
    line: "line",
    area: "area",
    combo: "combo",
    combo2: "combo2",
    scatter: "scatter",
    bubble: "bubble",
    pie: "pie",
    donut: "donut",
    treemap: "treemap",
    heatmap: "heatmap",
    table: "table",
    pushpin: "pushpin",
};

export function isDashboardViewLayoutWidgetClass(value: string): value is DashboardViewLayoutWidgetClass {
    return value in DASHBOARD_LAYOUT_WIDGET_CLASS;
}

export const DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS = 150;
export const DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT = 450;
export const DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT = 240;

export const WIDGET_DIMENSIONS_DEFAULT: IDashboardViewWidgetDimension = {
    minWidth: 4,
    defWidth: 6,
    defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
};

export const WIDGET_DIMENSIONS_TABLE: DashboardViewWidgetDimensionsByWidgetClass = {
    kpi: {
        minWidth: 2,
        defWidth: 2,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT,
    },
    headline: {
        minWidth: 2,
        defWidth: 2,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT,
    },
    xirr: {
        minWidth: 2,
        defWidth: 2,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_KPI_HEIGHT,
    },
    column: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    bar: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    line: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    area: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    combo: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    combo2: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    scatter: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    bubble: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    pie: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    donut: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    treemap: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    heatmap: {
        minWidth: 4,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    table: {
        minWidth: 3,
        defWidth: 12,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
    pushpin: {
        minWidth: 6,
        defWidth: 6,
        defHeightPx: DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT,
    },
};
