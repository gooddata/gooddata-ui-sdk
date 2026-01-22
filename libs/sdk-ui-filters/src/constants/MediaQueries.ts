// (C) 2007-2026 GoodData Corporation

const SCREEN = "only screen";

const ZERO_BREAKPOINT = 0;
const SMALL_BREAKPOINT = 640;

interface IMatchingRange {
    upper: number;
    lower: number;
}

const smallRange: IMatchingRange = {
    lower: ZERO_BREAKPOINT,
    upper: SMALL_BREAKPOINT,
};

const getQueryMatching = (range: IMatchingRange) =>
    `${SCREEN} and (min-width:${range.lower}px) and (max-width:${range.upper}px)`;

const mobileRange = smallRange;

const IS_MOBILE_DEVICE = getQueryMatching(mobileRange);

export const MediaQueries = {
    IS_MOBILE_DEVICE,
};
