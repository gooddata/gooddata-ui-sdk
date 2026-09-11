// (C) 2020-2026 GoodData Corporation

/**
 * Classification of the screen size according to its size with respect to the set breakpoints.
 *
 * @internal
 */
export type ResponsiveScreenType = "xxl" | "xl" | "lg" | "md" | "sm" | "xs";

/**
 * Breakpoints configuration.
 * Each breakpoint defines the maximum screen width in pixels according to which it is classified.
 *
 * @internal
 */
export type IBreakpointsConfig = {
    [s in ResponsiveScreenType]: number;
};

/**
 * Media query strings created according to configured breakpoints.
 *
 * @internal
 */
export interface IMediaQueries<T> {
    /**
     * Is screen classified as smaller than 'sm'?
     */
    "<sm": T;

    /**
     * Is screen classified as 'sm' or larger?
     */
    ">=sm": T;

    /**
     * Is screen classified as 'sm'?
     */
    sm: T;

    /**
     * Is screen classified as 'md' or larger?
     */
    ">=md": T;

    /**
     * Is screen classified as 'md' or smaller?
     */
    "<=md": T;

    /**
     * Is screen classified as 'md'?
     */
    md: T;

    /**
     * Is screen classified as 'lg' or larger?
     */
    ">=lg": T;

    /**
     * Is screen classified as 'lg' or smaller?
     */
    "<=lg": T;

    /**
     * Is screen classified as 'lg'?
     */
    lg: T;

    /**
     * Is screen classified as 'xl' or smaller?
     */
    "<=xl": T;

    /**
     * Is screen classified as 'xl' or larger?
     */
    ">=xl": T;

    /**
     * Is screen classified as 'xl'?
     */
    xl: T;

    /**
     * Is screen classified as 'xxl' or larger?
     */
    ">=xxl": T;

    /**
     * Is screen classified as 'xxl'?
     */
    xxl: T;

    /**
     * Is screen classified as a mobile device?
     */
    mobileDevice: T;

    /**
     * Is screen classified as other than mobile device?
     */
    "!mobileDevice": T;

    /**
     * Is screen classified as a desktop device?
     */
    desktop: T;

    /**
     * Is screen classified as smaller than desktop device?
     */
    "<desktop": T;
}

/**
 * The responsive configuration serves to configure breakpoints and other constants
 * that affect the visual appearance of components by the size of the window or element.
 *
 * @internal
 */
export interface IResponsiveConfig {
    breakpoints: IBreakpointsConfig;
}
