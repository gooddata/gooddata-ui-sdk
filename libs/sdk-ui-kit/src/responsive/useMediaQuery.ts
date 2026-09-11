// (C) 2007-2026 GoodData Corporation

import { useMediaQuery as useReactResponsiveMediaQuery } from "react-responsive";
import { invariant } from "ts-invariant";

import { type IMediaQueries } from "./interfaces.js";
import { useResponsiveContext } from "./ResponsiveContext.js";

const SCREEN = "only screen";

/**
 * @internal
 */
interface IMediaQueryRange {
    lower: number;
    upper: number;
}

const getQueryMatching = (range: IMediaQueryRange) => {
    return `${SCREEN} and (min-width:${range.lower}px) and (max-width:${range.upper}px)`;
};

const getQueryMatchingOrGreater = (range: IMediaQueryRange) => {
    return `${SCREEN} and (min-width:${range.lower}px)`;
};
const getQueryMatchingOrSmaller = (range: IMediaQueryRange) => {
    return `${SCREEN} and (max-width:${range.upper}px)`;
};

const getAnchorMatching = (range: IMediaQueryRange, anchor = -1) => {
    return range.lower <= anchor && anchor <= range.upper;
};

const getAnchorMatchingOrGreater = (range: IMediaQueryRange, anchor = -1) => {
    return range.lower <= anchor && anchor >= 0;
};
const getAnchorMatchingOrSmaller = (range: IMediaQueryRange, anchor = -1) => {
    return range.upper >= anchor && anchor >= 0;
};

/**
 * Hook, testing whether screen width matches provided media query.
 *
 * @internal
 * @param mediaQueryName - media query name to test
 * @param anchor - anchor point for the media query. If provided, the media query will be tested against the anchor point.
 * @returns boolean
 */
export const useMediaQuery = (mediaQueryName: keyof IMediaQueries<string>, anchor?: number): boolean => {
    const { breakpoints } = useResponsiveContext();

    const smallRange: IMediaQueryRange = {
        lower: 0,
        upper: breakpoints.sm,
    };

    const mediumRange: IMediaQueryRange = {
        lower: breakpoints.sm + 1,
        upper: breakpoints.md,
    };

    const largeRange: IMediaQueryRange = {
        lower: breakpoints.md + 1,
        upper: breakpoints.lg,
    };

    const xlargeRange: IMediaQueryRange = {
        lower: breakpoints.lg + 1,
        upper: breakpoints.xl,
    };

    const xxlargeRange: IMediaQueryRange = {
        lower: breakpoints.xl + 1,
        upper: breakpoints.xxl,
    };

    const desktopRange: IMediaQueryRange = {
        lower: xlargeRange.lower,
        upper: xxlargeRange.upper,
    };
    const smallerThanDesktop: IMediaQueryRange = {
        lower: 0,
        upper: largeRange.upper,
    };

    const mobileRange = smallRange;
    const notMobileRange: IMediaQueryRange = {
        lower: mediumRange.lower,
        upper: xxlargeRange.upper,
    };

    const mediaQueries: IMediaQueries<string> = {
        "<sm": getQueryMatching(smallRange),
        ">=sm": getQueryMatchingOrGreater(smallRange),
        sm: getQueryMatching(smallRange),
        ">=md": getQueryMatchingOrGreater(mediumRange),
        "<=md": getQueryMatchingOrSmaller(mediumRange),
        md: getQueryMatching(mediumRange),
        ">=lg": getQueryMatchingOrGreater(largeRange),
        "<=lg": getQueryMatchingOrSmaller(largeRange),
        lg: getQueryMatching(largeRange),
        "<=xl": getQueryMatchingOrSmaller(xlargeRange),
        ">=xl": getQueryMatchingOrGreater(xlargeRange),
        xl: getQueryMatching(xlargeRange),
        ">=xxl": getQueryMatchingOrGreater(xxlargeRange),
        xxl: getQueryMatching(xxlargeRange),
        mobileDevice: getQueryMatching(mobileRange),
        "!mobileDevice": getQueryMatching(notMobileRange),
        desktop: getQueryMatching(desktopRange),
        "<desktop": getQueryMatching(smallerThanDesktop),
    };

    const mediaAnchors: IMediaQueries<boolean> = {
        "<sm": getAnchorMatching(smallRange, anchor),
        ">=sm": getAnchorMatchingOrGreater(smallRange, anchor),
        sm: getAnchorMatching(smallRange, anchor),
        ">=md": getAnchorMatchingOrGreater(mediumRange, anchor),
        "<=md": getAnchorMatchingOrSmaller(mediumRange, anchor),
        md: getAnchorMatching(mediumRange, anchor),
        ">=lg": getAnchorMatchingOrGreater(largeRange, anchor),
        "<=lg": getAnchorMatchingOrSmaller(largeRange, anchor),
        lg: getAnchorMatching(largeRange, anchor),
        "<=xl": getAnchorMatchingOrSmaller(xlargeRange, anchor),
        ">=xl": getAnchorMatchingOrGreater(xlargeRange, anchor),
        xl: getAnchorMatching(xlargeRange, anchor),
        ">=xxl": getAnchorMatchingOrGreater(xxlargeRange, anchor),
        xxl: getAnchorMatching(xxlargeRange, anchor),
        mobileDevice: getAnchorMatching(mobileRange, anchor),
        "!mobileDevice": getAnchorMatching(notMobileRange, anchor),
        desktop: getAnchorMatching(desktopRange, anchor),
        "<desktop": getAnchorMatching(smallerThanDesktop, anchor),
    };

    const mediaQuery = mediaQueries[mediaQueryName];
    invariant(mediaQuery, `Please provide valid media query name! Actual: ${mediaQuery}`);

    const query = useReactResponsiveMediaQuery({ query: mediaQuery });
    const anchored = mediaAnchors[mediaQueryName];

    if (anchor) {
        return anchored;
    }
    return query;
};
