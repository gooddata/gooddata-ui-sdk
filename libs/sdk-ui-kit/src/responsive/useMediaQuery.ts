// (C) 2007-2021 GoodData Corporation
import { useResponsiveContext } from "./ResponsiveContext.js";
import { useMediaQuery as useReactResponsiveMediaQuery } from "react-responsive";
import { invariant } from "ts-invariant";
import { IMediaQueries } from "./interfaces.js";

const SCREEN = "only screen";

/**
 * @internal
 */
interface IMediaQueryRange {
    lower: number;
    upper: number;
}

const getQueryMatching = (range: IMediaQueryRange) =>
    `${SCREEN} and (min-width:${range.lower}px) and (max-width:${range.upper}px)`;

const getQueryMatchingOrGreater = (range: IMediaQueryRange) => `${SCREEN} and (min-width:${range.lower}px)`;

/**
 * Hook, testing whether screen width matches provided media query.
 *
 * @internal
 * @param mediaQueryName - media query name to test
 * @returns boolean
 */
export const useMediaQuery = (mediaQueryName: keyof IMediaQueries): boolean => {
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

    const mediaQueries: IMediaQueries = {
        "<sm": getQueryMatching(smallRange),
        ">=sm": getQueryMatchingOrGreater(smallRange),
        sm: getQueryMatching(smallRange),
        ">=md": getQueryMatchingOrGreater(mediumRange),
        md: getQueryMatching(mediumRange),
        ">=lg": getQueryMatchingOrGreater(largeRange),
        lg: getQueryMatching(largeRange),
        ">=xl": getQueryMatchingOrGreater(xlargeRange),
        xl: getQueryMatching(xlargeRange),
        ">=xxl": getQueryMatchingOrGreater(xxlargeRange),
        xxl: getQueryMatching(xxlargeRange),
        mobileDevice: getQueryMatching(mobileRange),
        "!mobileDevice": getQueryMatching(notMobileRange),
        desktop: getQueryMatching(desktopRange),
        "<desktop": getQueryMatching(smallerThanDesktop),
    };

    const mediaQuery = mediaQueries[mediaQueryName];
    invariant(mediaQuery, `Please provide valid media query name! Actual: ${mediaQuery}`);

    return useReactResponsiveMediaQuery({ query: mediaQuery });
};
