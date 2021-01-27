// (C) 2021 GoodData Corporation
import { SCREEN_BREAKPOINT_SM } from "../../DashboardLayout/constants";

const mobileRange = {
    lower: 0,
    upper: SCREEN_BREAKPOINT_SM,
};

const getQueryMatching = (range: { lower: number; upper: number }) =>
    `only screen and (min-width:${range.lower}px) and (max-width:${range.upper}px)`;

// TODO unify this with similar stuff in sdk-ui-filters and probably move to sdk-ui
export const IS_MOBILE_DEVICE = getQueryMatching(mobileRange);
