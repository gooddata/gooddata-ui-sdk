// (C) 2020-2021 GoodData Corporation

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
export interface IMediaQueries {
    /**
     * Is screen classified as smaller than 'sm'?
     */
    "<sm": string;

    /**
     * Is screen classified as 'sm' or larger?
     */
    ">=sm": string;

    /**
     * Is screen classified as 'sm'?
     */
    sm: string;

    /**
     * Is screen classified as 'md' or larger?
     */
    ">=md": string;

    /**
     * Is screen classified as 'md'?
     */
    md: string;

    /**
     * Is screen classified as 'lg' or larger?
     */
    ">=lg": string;

    /**
     * Is screen classified as 'lg'?
     */
    lg: string;

    /**
     * Is screen classified as 'xl' or larger?
     */
    ">=xl": string;

    /**
     * Is screen classified as 'xl'?
     */
    xl: string;

    /**
     * Is screen classified as 'xxl' or larger?
     */
    ">=xxl": string;

    /**
     * Is screen classified as 'xxl'?
     */
    xxl: string;

    /**
     * Is screen classified as a mobile device?
     */
    mobileDevice: string;

    /**
     * Is screen classified as other than mobile device?
     */
    "!mobileDevice": string;

    /**
     * Is screen classified as a desktop device?
     */
    desktop: string;

    /**
     * Is screen classified as smaller than desktop device?
     */
    "<desktop": string;
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
