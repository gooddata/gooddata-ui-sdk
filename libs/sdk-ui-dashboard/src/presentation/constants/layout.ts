// (C) 2021-2022 GoodData Corporation
import { Configuration } from "react-grid-system";
import { ScreenSize } from "@gooddata/sdk-model";

export const ALL_SCREENS: ScreenSize[] = ["xl", "lg", "md", "sm", "xs"];

// Breakpoints
export const SCREEN_BREAKPOINT_XS = 320;
export const SCREEN_BREAKPOINT_SM = 640;
export const SCREEN_BREAKPOINT_MD = 940;
export const SCREEN_BREAKPOINT_LG = 1170;
export const SCREEN_BREAKPOINT_XL = 1590;
export const SCREEN_BREAKPOINT_XXL = 99999999;

const DASHBOARD_LAYOUT_GUTTER_WIDTH = 0;

const DASHBOARD_LAYOUT_BREAKPOINT_XS = SCREEN_BREAKPOINT_XS + 1;
const DASHBOARD_LAYOUT_BREAKPOINT_SM = SCREEN_BREAKPOINT_SM + 1;
const DASHBOARD_LAYOUT_BREAKPOINT_MD = SCREEN_BREAKPOINT_LG + 1;
const DASHBOARD_LAYOUT_BREAKPOINT_LG = SCREEN_BREAKPOINT_XL + 1;

const DASHBOARD_LAYOUT_BREAK_POINTS: number[] = [
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

export const DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS = 150;
export const GRID_ROW_HEIGHT_IN_PX = 20;
