// (C) 2019-2024 GoodData Corporation

const SCREEN_BREAKPOINT_SM = 640;
// https://github.com/gooddata/gdc-goodstrap/blob/master/src/core/MediaQueries.js#L61
export const isMobileView = (): boolean => window.innerWidth <= SCREEN_BREAKPOINT_SM;
