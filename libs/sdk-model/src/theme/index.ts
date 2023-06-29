// (C) 2020-2022 GoodData Corporation

import { IMetadataObject } from "../ldm/metadata/index.js";

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
 * Used to color various elements across many components by replacing
 * the default complementary palette of gray color shades
 *
 * @remarks
 * Contains up to 10 shades, typically the first one being the lightest
 * and the last being the darkest, or vice-versa for the dark-based designs
 *
 * The first and last shades are mandatory, the rest is automatically
 * calculated if not provided
 *
 * @beta
 */
export interface IThemeComplementaryPalette {
    c0: ThemeColor;
    c1?: ThemeColor;
    c2?: ThemeColor;
    c3?: ThemeColor;
    c4?: ThemeColor;
    c5?: ThemeColor;
    c6?: ThemeColor;
    c7?: ThemeColor;
    c8?: ThemeColor;
    c9: ThemeColor;
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

    /**
     * Used to color various elements across many components
     *
     * See {@link IThemeComplementaryPalette} for more details.
     */
    complementary?: IThemeComplementaryPalette;
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
 * Kpi value specific properties.
 *
 * @beta
 */
export interface IThemeKpiValue {
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
    value?: IThemeKpiValue;

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
 *
 * @beta
 */
export interface IThemeChart {
    /**
     * Background color
     */
    backgroundColor?: ThemeColor;

    /**
     * Grid line color
     */
    gridColor?: ThemeColor;

    /**
     * Axis line color
     */
    axisColor?: ThemeColor;

    /**
     * Axis label color, title name of axis
     */
    axisLabelColor?: ThemeColor;

    /**
     * Axis value color, numbers or names under axis
     */
    axisValueColor?: ThemeColor;

    /**
     * Legend value color
     */
    legendValueColor?: ThemeColor;

    /**
     * Tooltip background color
     */
    tooltipBackgroundColor?: ThemeColor;

    /**
     * Tooltip border color
     */
    tooltipBorderColor?: ThemeColor;

    /**
     * Tooltip label color
     */
    tooltipLabelColor?: ThemeColor;

    /**
     * Tooltip value color
     */
    tooltipValueColor?: ThemeColor;
}

/**
 * Table customization
 *
 * @beta
 */
export interface IThemeTable {
    /**
     * Background color
     */
    backgroundColor?: ThemeColor;

    /**
     * Grid line color
     */
    gridColor?: ThemeColor;

    /**
     * Value color
     */
    valueColor?: ThemeColor;

    /**
     * Color of null value (dash)
     */
    nullValueColor?: ThemeColor;

    /**
     * Color of loading icon
     */
    loadingIconColor?: ThemeColor;

    /**
     * Background color of hovered row
     */
    hoverBackgroundColor?: ThemeColor;

    /**
     * Color of header labels
     */
    headerLabelColor?: ThemeColor;

    /**
     * Background color of hovered header row
     */
    headerHoverBackgroundColor?: ThemeColor;

    /**
     * Background color of total values
     */
    totalBackgroundColor?: ThemeColor;

    /**
     * Background color of subtotal values
     */
    subtotalBackgroundColor?: ThemeColor;

    /**
     * Color of total value
     */
    totalValueColor?: ThemeColor;
}

/**
 * Button customizable UI properties
 *
 * @beta
 */
export interface IThemeButton {
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
}

/**
 * Tooltip customizable UI properties
 *
 * @beta
 */
export interface IThemeTooltip {
    /**
     * Background color of the tooltip
     */
    backgroundColor?: ThemeColor;

    /**
     * Foreground color of the tooltip
     */
    color?: ThemeColor;
}

/**
 * Properties of the title of the modal.
 *
 * @beta
 */
export interface IThemeModalTitle {
    /**
     * Foreground color of the tooltip
     */
    color?: ThemeColor;

    /**
     * Color of the line separator between the title and the content
     */
    lineColor?: ThemeColor;
}

/**
 * Modal customizable properties.
 *
 * @beta
 */
export interface IThemeModal {
    /**
     * Title of the modal
     */
    title?: IThemeModalTitle;

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
}

/**
 * Dashboard title specific properties.
 *
 * @beta
 */
export interface IThemeDashboardTitle {
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
}

/**
 * Dashboard section title properties.
 *
 * @beta
 */
export interface IThemeDashboardSectionTitle {
    /**
     * Foreground color of the section
     */
    color?: ThemeColor;

    /**
     * Color of the line separator between the sections
     */
    lineColor?: ThemeColor;
}

/**
 * Dashboard section description properties.
 *
 * @beta
 */
export interface IThemeDashboardSectionDescription {
    /**
     * Foreground color of the section
     */
    color?: ThemeColor;
}

/**
 * Dashboard section customizable properties.
 *
 * @beta
 */
export interface IThemeDashboardSection {
    /**
     * Section title properties
     */

    title?: IThemeDashboardSectionTitle;
    /**
     * Section description properties
     */

    description?: IThemeDashboardSectionDescription;
}

/**
 * Filter bar button specific properties
 *
 * @beta
 */
export interface IThemeDashboardFilterBarButton {
    /**
     * Background color of the filter bar button
     */
    backgroundColor?: ThemeColor;
}

/**
 * Dashboard filterBar customizable properties.
 *
 * @beta
 */
export interface IThemeDashboardFilterBar {
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
    filterButton?: IThemeDashboardFilterBarButton;
}

/**
 * Dashboard content widget customizable properties.
 *
 * @beta
 */
export interface IThemeDashboardContentWidget {
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
}

/**
 * Dashboard content KPI customizable properties.
 *
 * @beta
 */
export interface IThemeDashboardContentKpi {
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
}

/**
 * Dashboard content customizable properties.
 *
 * @beta
 */
export interface IThemeDashboardContent {
    /**
     * Background color of the dashboard content
     */
    backgroundColor?: ThemeColor;

    /**
     * Widget specific properties
     */

    widget?: IThemeDashboardContentWidget;

    /**
     * Kpi widget specific properties
     */

    kpiWidget?: IThemeDashboardContentKpi;
}

/**
 * Dashboard navigation title specific properties.
 *
 * @beta
 */
export interface IThemeDashboardNavigationTitle {
    /**
     * Header foreground color
     */
    color?: ThemeColor;
}

/**
 * Navigation items (dashboards) specific properties.
 *
 * @beta
 */
export interface IThemeDashboardNavigationItem {
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
}

/**
 * Navigation customizable properties.
 *
 * @beta
 */
export interface IThemeDashboardNavigation {
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
    title?: IThemeDashboardNavigationTitle;

    /**
     * Navigation items (dashboards) specific properties
     */
    item?: IThemeDashboardNavigationItem;
}

/**
 * Edit panel specific properties.
 *
 * @beta
 */
export interface IThemeDashboardEditPanel {
    /**
     * Edit panel background color
     */
    backgroundColor?: ThemeColor;
}

/**
 * KPI dashboards specific properties
 *
 * @beta
 */
export interface IThemeDashboard {
    /**
     * Title specific properties
     */

    title?: IThemeDashboardTitle;

    /**
     * Section specific properties
     */

    section?: IThemeDashboardSection;

    /**
     * Filter bar specific properties
     */

    filterBar?: IThemeDashboardFilterBar;

    /**
     * Dashboard content specific properties
     */

    content?: IThemeDashboardContent;

    /**
     * Navigation specific properties (left panel)
     */
    navigation?: IThemeDashboardNavigation;

    /**
     * Edit panel specific properties
     */
    editPanel?: IThemeDashboardEditPanel;
}

/**
 * Analytical designer title specific properties.
 *
 * @beta
 */
export interface IThemeAnalyticalDesignerTitle {
    /**
     * Foreground color of the title
     */
    color?: ThemeColor;
}

/**
 * Analytical designer specific properties.
 *
 * @beta
 */
export interface IThemeAnalyticalDesigner {
    /**
     * Title specific properties
     */

    title?: IThemeAnalyticalDesignerTitle;
}

/**
 * Theme used to customize selected parts of the UI
 *
 * @remarks
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
    button?: IThemeButton;

    /**
     * Tooltip customizable UI properties
     */
    tooltip?: IThemeTooltip;

    /**
     * Modal customizable UI properties
     */
    modal?: IThemeModal;

    /**
     * Global Kpi/Headline customizable UI properties
     */
    kpi?: IThemeKpi;

    /**
     * Chart customizable UI properties
     */
    chart?: IThemeChart;

    /**
     * Table customizable UI properties
     */
    table?: IThemeTable;

    /**
     * KPI dashboards specific properties
     */
    dashboards?: IThemeDashboard;

    /**
     * Analytical designer specific properties
     */
    analyticalDesigner?: IThemeAnalyticalDesigner;
}

/**
 * Theme metadata object
 *
 * @alpha
 */
export interface IThemeMetadataObject extends IMetadataObject {
    readonly type: "theme";
    readonly theme: ITheme;
}

/**
 * Theme definition represents modified or created theme
 *
 * @alpha
 */
export interface IThemeDefinition extends Partial<IMetadataObject> {
    readonly type: "theme";
    readonly theme: ITheme;
}
