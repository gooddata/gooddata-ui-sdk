// (C) 2019-2020 GoodData Corporation
import { SCREEN_BREAKPOINT_SM } from "../../../internal/dashboardEmbedding";

// https://github.com/gooddata/gdc-goodstrap/blob/master/src/core/MediaQueries.js#L61
export const isMobileView = (): boolean => window.innerWidth <= SCREEN_BREAKPOINT_SM;
