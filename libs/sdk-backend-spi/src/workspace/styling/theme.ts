// (C) 2020 GoodData Corporation

/**
 * Custom font URI which is used to override the default font
 *
 * @beta
 */
export type ThemeFontUri = string;

/**
 * Definition of both normal and bold font URIs
 *
 * @beta
 */
export interface IThemeTypography {
    /**
     * Normal font URI
     */
    font?: ThemeFontUri;

    /**
     * Bold font URI
     */
    fontBold?: ThemeFontUri;
}

/**
 * Color string in hex format, e.g. #14b2e2
 *
 * @beta
 */
export type ThemeColor = string;

/**
 * Variants of the palette color
 *
 * @beta
 */
export interface IThemeColorFamily {
    /**
     * Base color
     */
    base: ThemeColor;

    /**
     * Light variant of base color
     */
    light?: ThemeColor;

    /**
     * Dark variant of base color
     */
    dark?: ThemeColor;

    /**
     * Color contrast to main color
     *
     * Is used as foreground color of the button with base background color for instance
     */
    contrast?: ThemeColor;
}

/**
 * Customizable palette of major colors
 *
 * Inspired by Material UI palette: https://material-ui.com/customization/palette/
 *
 * @beta
 */
export interface IThemePalette {
    /**
     * Used as an accent color for most of the UI elements
     */
    primary?: IThemeColorFamily;

    /**
     * Used to express error
     */
    error?: IThemeColorFamily;

    /**
     * Used to express warning
     */
    warning?: IThemeColorFamily;

    /**
     * Used to express success
     */
    success?: IThemeColorFamily;

    /**
     * Used to express info or progress
     */
    info?: IThemeColorFamily;
}

/**
 * Title of the widget
 *
 * @beta
 */
export interface IThemeWidgetTitle {
    /**
     * Title text color
     */
    color?: ThemeColor;

    /**
     * Align of the text
     */
    textAlign?: string;
}

/**
 * Kpi values customization
 *
 * @beta
 */
export interface IThemeKpi {
    /**
     * Kpi value specific properties
     */
    value?: {
        /**
         * Value align
         */
        textAlign?: string;

        /**
         * Color of the value considered to be positive
         */
        positiveColor?: ThemeColor;

        /**
         * Color of the value considered to be negative
         */
        negativeColor?: ThemeColor;
    };

    /**
     * Color of the primary measure value (main)
     */
    primaryMeasureColor?: ThemeColor;

    /**
     * Color of the secondary measure value (informative)
     */
    secondaryInfoColor?: ThemeColor;
}

/**
 * Charts customization
 * Experimental support for theming of charts.
 * Not production ready yet!
 *
 * @internal
 */
export interface IThemeChart {
    /**
     * Background color
     */
    backgroundColor?: IThemeColorFamily;
    /**
     * Texts color
     */
    textColor?: IThemeColorFamily;
}

/**
 * Theme used to customize selected parts of the UI
 *
 * Only the primary color main value is mandatory
 *
 * Optional properties are replaced with the default values
 *
 * @beta
 */
export interface ITheme {
    /**
     * Typography
     *
     * Definition of both normal and bold font URIs
     */
    typography?: IThemeTypography;

    /**
     * Customizable palette of major colors
     *
     * Inspired by Material UI palette: https://material-ui.com/customization/palette/
     */
    palette?: IThemePalette;

    /**
     * Button customizable UI properties
     */
    button?: {
        /**
         * Radius of the button border in px
         */
        borderRadius?: string;

        /**
         * Flag determining whether the button has a shadow or not
         */
        dropShadow?: boolean;

        /**
         * Flag determining whether the button has its text capitalized or not
         */
        textCapitalization?: boolean;
    };

    /**
     * Tooltip customizable UI properties
     */
    tooltip?: {
        /**
         * Background color of the tooltip
         */
        backgroundColor?: ThemeColor;

        /**
         * Foreground color of the tooltip
         */
        color?: ThemeColor;
    };

    /**
     * Modal customizable UI properties
     */
    modal?: {
        /**
         * Title of the modal
         */
        title?: {
            /**
             * Foreground color of the tooltip
             */
            color?: ThemeColor;

            /**
             * Color of the line separator between the title and the content
             */
            lineColor?: ThemeColor;
        };

        /**
         * Background color of the modal surroundings
         */
        outsideBackgroundColor?: ThemeColor;

        /**
         * Flag determining whether the button has a shadow or not
         */
        dropShadow?: boolean;

        /**
         * Width of the border
         */
        borderWidth?: string;

        /**
         * Color of the border
         */
        borderColor?: ThemeColor;

        /**
         * Radius of the border in px
         */
        borderRadius?: string;
    };

    /**
     * Global Kpi/Headline customizable UI properties
     */
    kpi?: IThemeKpi;

    /**
     * Chart customizable UI properties
     */
    chart?: IThemeChart;

    /**
     * KPI dashboards specific properties
     */
    dashboards?: {
        /**
         * Title specific properties
         */

        title?: {
            /**
             * Foreground color of the title
             */
            color?: ThemeColor;

            /**
             * Background color of the title
             */
            backgroundColor?: ThemeColor;

            /**
             * Border color of the title
             */
            borderColor?: ThemeColor;
        };

        /**
         * Section specific properties
         */

        section?: {
            /**
             * Section title properties
             */

            title?: {
                /**
                 * Foreground color of the section
                 */
                color?: ThemeColor;

                /**
                 * Color of the line separator between the sections
                 */
                lineColor?: ThemeColor;
            };
            /**
             * Section title properties
             */

            description?: {
                /**
                 * Foreground color of the section
                 */
                color?: ThemeColor;
            };
        };

        /**
         * Filter bar specific properties
         */

        filterBar?: {
            /**
             * Background color of the filter bar
             */
            backgroundColor?: ThemeColor;

            /**
             * Border color of the filter bar
             */
            borderColor?: ThemeColor;

            /**
             * Filter bar button specific properties
             */

            filterButton?: {
                /**
                 * Background color of the filter bar button
                 */
                backgroundColor?: ThemeColor;
            };
        };

        /**
         * Dashboard content specific properties
         */

        content?: {
            /**
             * Background color of the dashboard content
             */
            backgroundColor?: ThemeColor;

            /**
             * Widget specific properties
             */

            widget?: {
                /**
                 * Widget title color and alignment
                 */

                title?: IThemeWidgetTitle;

                /**
                 * Widget background color
                 */
                backgroundColor?: ThemeColor;

                /**
                 * Widget border color
                 */
                borderColor?: ThemeColor;

                /**
                 * Widget border width
                 */
                borderWidth?: string;

                /**
                 * Widget border radius in px
                 */
                borderRadius?: string;

                /**
                 * Flag determining whether the widget has a shadow or not
                 */
                dropShadow?: boolean;
            };

            /**
             * Kpi widget specific properties
             */

            kpiWidget?: {
                /**
                 * Kpi widget title color and alignment
                 */

                title?: IThemeWidgetTitle;

                /**
                 * Kpi widget background color
                 */
                backgroundColor?: ThemeColor;

                /**
                 * Kpi widget border color
                 */
                borderColor?: ThemeColor;

                /**
                 * Kpi widget border width
                 */
                borderWidth?: string;

                /**
                 * Kpi widget border radius in px
                 */
                borderRadius?: string;

                /**
                 * Flag determining whether the kpi widget has a shadow or not
                 */
                dropShadow?: boolean;

                /**
                 * Dashboards specific Kpi/Headline customizable UI properties
                 */
                kpi?: IThemeKpi;
            };
        };

        /**
         * Navigation specific properties (left panel)
         */
        navigation?: {
            /**
             * Navigation background color
             */
            backgroundColor?: ThemeColor;

            /**
             * Navigation border color
             */
            borderColor?: ThemeColor;

            /**
             * Navigation header specific properties
             */
            title?: {
                /**
                 * Header foreground color
                 */
                color?: ThemeColor;
            };

            /**
             * Navigation items (dashboards) specific properties
             */
            item?: {
                /**
                 * Item foreground color
                 */
                color?: ThemeColor;

                /**
                 * Item foreground color on hover
                 */
                hoverColor?: ThemeColor;

                /**
                 * Selected item foreground color
                 */
                selectedColor?: ThemeColor;

                /**
                 * Selected item background color
                 */
                selectedBackgroundColor?: ThemeColor;
            };
        };

        /**
         * Edit panel specific properties
         */
        editPanel?: {
            /**
             * Edit panel background color
             */
            backgroundColor?: ThemeColor;
        };
    };

    /**
     * Analytical designer specific properties
     */
    analyticalDesigner?: {
        /**
         * Title specific properties
         */

        title?: {
            /**
             * Foreground color of the title
             */
            color?: ThemeColor;
        };
    };
}
