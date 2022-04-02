// (C) 2020-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Custom font URI which is used to override the default font
 *
 * @deprecated Use {@link @gooddata/sdk-model#ThemeFontUri}
 * @beta
 */
export type ThemeFontUri = m.ThemeFontUri;

/**
 * Definition of both normal and bold font URIs
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeTypography}
 * @beta
 */
export interface IThemeTypography extends m.IThemeTypography {}

/**
 * Color string in hex format, e.g. #14b2e2
 *
 * @deprecated Use {@link @gooddata/sdk-model#ThemeColor}
 * @beta
 */
export type ThemeColor = m.ThemeColor;

/**
 * Variants of the palette color
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeColorFamily}
 * @beta
 */
export interface IThemeColorFamily extends m.IThemeColorFamily {}

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
 * @deprecated Use {@link @gooddata/sdk-model#IThemeComplementaryPalette}
 * @beta
 */
export interface IThemeComplementaryPalette extends m.IThemeComplementaryPalette {}

/**
 * Customizable palette of major colors
 *
 * Inspired by Material UI palette: https://material-ui.com/customization/palette/
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemePalette}
 * @beta
 */
export interface IThemePalette extends m.IThemePalette {}

/**
 * Title of the widget
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeWidgetTitle}
 * @beta
 */
export interface IThemeWidgetTitle extends m.IThemeWidgetTitle {}

/**
 * Kpi value specific properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeKpiValue}
 * @beta
 */
export interface IThemeKpiValue extends m.IThemeKpiValue {}

/**
 * Kpi values customization
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeKpi}
 * @beta
 */
export interface IThemeKpi extends m.IThemeKpi {}

/**
 * Charts customization
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeChart}
 * @beta
 */
export interface IThemeChart extends m.IThemeChart {}

/**
 * Table customization
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeTable}
 * @beta
 */
export interface IThemeTable extends m.IThemeTable {}

/**
 * Button customizable UI properties
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeButton}
 * @beta
 */
export interface IThemeButton extends m.IThemeButton {}

/**
 * Tooltip customizable UI properties
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeTooltip}
 * @beta
 */
export interface IThemeTooltip extends m.IThemeTooltip {}

/**
 * Properties of the title of the modal.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeModalTitle}
 * @beta
 */
export interface IThemeModalTitle extends m.IThemeModalTitle {}

/**
 * Modal customizable properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeModal}
 * @beta
 */
export interface IThemeModal extends m.IThemeModal {}

/**
 * Dashboard title specific properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardTitle}
 * @beta
 */
export interface IThemeDashboardTitle extends m.IThemeDashboardTitle {}

/**
 * Dashboard section title properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardSectionTitle}
 * @beta
 */
export interface IThemeDashboardSectionTitle extends m.IThemeDashboardSectionTitle {}

/**
 * Dashboard section description properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardSectionDescription}
 * @beta
 */
export interface IThemeDashboardSectionDescription extends m.IThemeDashboardSectionDescription {}

/**
 * Dashboard section customizable properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardSection}
 * @beta
 */
export interface IThemeDashboardSection extends m.IThemeDashboardSection {}

/**
 * Filter bar button specific properties
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardFilterBarButton}
 * @beta
 */
export interface IThemeDashboardFilterBarButton extends m.IThemeDashboardFilterBarButton {}

/**
 * Dashboard filterBar customizable properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardFilterBar}
 * @beta
 */
export interface IThemeDashboardFilterBar extends m.IThemeDashboardFilterBar {}

/**
 * Dashboard content widget customizable properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardContentWidget}
 * @beta
 */
export interface IThemeDashboardContentWidget extends m.IThemeDashboardContentWidget {}

/**
 * Dashboard content KPI customizable properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardContentKpi}
 * @beta
 */
export interface IThemeDashboardContentKpi extends m.IThemeDashboardContentKpi {}

/**
 * Dashboard content customizable properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardContent}
 * @beta
 */
export interface IThemeDashboardContent extends m.IThemeDashboardContent {}

/**
 * Dashboard navigation title specific properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardNavigationTitle}
 * @beta
 */
export interface IThemeDashboardNavigationTitle extends m.IThemeDashboardNavigationTitle {}

/**
 * Navigation items (dashboards) specific properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardNavigationItem}
 * @beta
 */
export interface IThemeDashboardNavigationItem extends m.IThemeDashboardNavigationItem {}

/**
 * Navigation customizable properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardNavigation}
 * @beta
 */
export interface IThemeDashboardNavigation extends m.IThemeDashboardNavigation {}

/**
 * Edit panel specific properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboardEditPanel}
 * @beta
 */
export interface IThemeDashboardEditPanel extends m.IThemeDashboardEditPanel {}

/**
 * KPI dashboards specific properties
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeDashboard}
 * @beta
 */
export interface IThemeDashboard extends m.IThemeDashboard {}

/**
 * Analytical designer title specific properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeAnalyticalDesignerTitle}
 * @beta
 */
export interface IThemeAnalyticalDesignerTitle extends m.IThemeAnalyticalDesignerTitle {}

/**
 * Analytical designer specific properties.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IThemeAnalyticalDesigner}
 * @beta
 */
export interface IThemeAnalyticalDesigner extends m.IThemeAnalyticalDesigner {}

/**
 * Theme used to customize selected parts of the UI
 *
 * @remarks
 * Only the primary color main value is mandatory
 *
 * Optional properties are replaced with the default values
 *
 * @deprecated Use {@link @gooddata/sdk-model#ITheme}
 * @beta
 */
export interface ITheme extends m.ITheme {}
