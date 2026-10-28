// (C) 2026 GoodData Corporation

/**
 * Length in px on the page's design canvas, zero or more.
 *
 * @alpha
 */
export type PublisherPxV2 = number;

/**
 * Number from 0 to 1.
 *
 * @alpha
 */
export type PublisherOpacityV2 = number;

/**
 * @alpha
 */
export type PublisherHorizontalAlignV2 = "left" | "center" | "right";

/**
 * @alpha
 */
export type PublisherVerticalAlignV2 = "top" | "center" | "bottom";

/**
 * Theme color reference or literal color.
 *
 * @remarks
 * A reference is the whole value, never part of a longer string:
 * `{theme.colors.<list>.<id>}`, where list is `backgrounds`, `texts` or `lines`, or a color of the
 * platform palette (see {@link PublisherThemePaletteReferenceV2}): `{theme.palette.<name>}`, where name
 * is `primary`, `success`, `error`, `warning` or `info`, or `{theme.palette.complementary.c0}` to `c9`.
 * The ids `default`, `surface`, `inverse`, `muted` and `accent` always resolve.
 *
 * A literal is `#rgb`, `#rrggbb`, `#rrggbbaa`, or `rgb()` with 3 or 4 arguments. `#rgba` is invalid.
 *
 * @alpha
 */
export type PublisherColorValueV2 = string;

/**
 * @alpha
 */
export type PublisherGapValueV2 =
    | PublisherPxV2
    | "{theme.spacing.gap.compact}"
    | "{theme.spacing.gap.normal}"
    | "{theme.spacing.gap.spacious}";

/**
 * @alpha
 */
export type PublisherPaddingValueV2 =
    | PublisherPxV2
    | "{theme.spacing.padding.compact}"
    | "{theme.spacing.padding.normal}"
    | "{theme.spacing.padding.spacious}";

/**
 * @alpha
 */
export type PublisherRadiusValueV2 =
    | PublisherPxV2
    | "{theme.corners.small}"
    | "{theme.corners.medium}"
    | "{theme.corners.large}"
    | "{theme.corners.full}";

/**
 * `{theme.shadows.<name>}` or `none`.
 *
 * @alpha
 */
export type PublisherShadowValueV2 = string;

/**
 * @alpha
 */
export type PublisherBorderLineStyleV2 = "solid" | "dashed" | "dotted" | "none";

/**
 * Theme image reference or https URL.
 *
 * @remarks
 * A reference is the whole value: `{theme.logo}`, `{theme.coverImage}`, `{theme.assets.logos.<id>}`
 * or `{theme.assets.images.<id>}`.
 *
 * A URL must start with `https://` and may contain text variables; each resolved value is
 * percent-encoded and the result must still start with `https://`.
 *
 * @alpha
 */
export type PublisherImageSourceV2 = string;

/**
 * @alpha
 */
export const PublisherTextStyleNamesV2 = [
    "title",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "largeText",
    "normalText",
    "smallText",
] as const;

/**
 * Named text style from the theme's `documents.textStyle`.
 *
 * @alpha
 */
export type PublisherTextStyleNameV2 = (typeof PublisherTextStyleNamesV2)[number];

/**
 * @alpha
 */
export function isPublisherTextStyleNameV2(value: unknown): value is PublisherTextStyleNameV2 {
    return PublisherTextStyleNamesV2.some((name) => name === value);
}

/**
 * @alpha
 */
export interface IPublisherBackgroundStyleV2 {
    backgroundColor?: PublisherColorValueV2;
    /**
     * Opacity of the background color only.
     */
    backgroundOpacity?: PublisherOpacityV2;
    backgroundImage?: PublisherImageSourceV2;
    backgroundImageOpacity?: PublisherOpacityV2;
    /**
     * Defaults to `cover`.
     */
    backgroundFit?: "cover" | "contain" | "fill" | "tile";
    backgroundHorizontalAlign?: PublisherHorizontalAlignV2;
    backgroundVerticalAlign?: PublisherVerticalAlignV2;
    backgroundOffset?: PublisherPxV2;
    backgroundOffsetTop?: PublisherPxV2;
    backgroundOffsetRight?: PublisherPxV2;
    backgroundOffsetBottom?: PublisherPxV2;
    backgroundOffsetLeft?: PublisherPxV2;
}

/**
 * @remarks
 * A side key wins over `padding` in any order.
 *
 * @alpha
 */
export interface IPublisherPaddingStyleV2 {
    padding?: PublisherPaddingValueV2;
    paddingTop?: PublisherPaddingValueV2;
    paddingRight?: PublisherPaddingValueV2;
    paddingBottom?: PublisherPaddingValueV2;
    paddingLeft?: PublisherPaddingValueV2;
}

/**
 * @remarks
 * A side key wins over the matching all-sides key in any order. `borderStyle` defaults to `solid`,
 * so a width alone draws a line.
 *
 * @alpha
 */
export interface IPublisherBorderStyleV2 {
    borderWidth?: PublisherPxV2;
    borderStyle?: PublisherBorderLineStyleV2;
    borderColor?: PublisherColorValueV2;
    borderTopWidth?: PublisherPxV2;
    borderTopStyle?: PublisherBorderLineStyleV2;
    borderTopColor?: PublisherColorValueV2;
    borderRightWidth?: PublisherPxV2;
    borderRightStyle?: PublisherBorderLineStyleV2;
    borderRightColor?: PublisherColorValueV2;
    borderBottomWidth?: PublisherPxV2;
    borderBottomStyle?: PublisherBorderLineStyleV2;
    borderBottomColor?: PublisherColorValueV2;
    borderLeftWidth?: PublisherPxV2;
    borderLeftStyle?: PublisherBorderLineStyleV2;
    borderLeftColor?: PublisherColorValueV2;
}

/**
 * @remarks
 * A corner key wins over `borderRadius` in any order.
 *
 * @alpha
 */
export interface IPublisherCornerStyleV2 {
    borderRadius?: PublisherRadiusValueV2;
    borderTopLeftRadius?: PublisherRadiusValueV2;
    borderTopRightRadius?: PublisherRadiusValueV2;
    borderBottomRightRadius?: PublisherRadiusValueV2;
    borderBottomLeftRadius?: PublisherRadiusValueV2;
}

/**
 * @remarks
 * The part keys override the named `shadow`, or define a shadow without one.
 *
 * @alpha
 */
export interface IPublisherShadowStyleV2 {
    shadow?: PublisherShadowValueV2;
    /**
     * px on the design canvas; may be negative.
     */
    shadowX?: number;
    /**
     * px on the design canvas; may be negative.
     */
    shadowY?: number;
    shadowBlur?: PublisherPxV2;
    /**
     * px on the design canvas; may be negative.
     */
    shadowSpread?: number;
    shadowColor?: PublisherColorValueV2;
    shadowOpacity?: PublisherOpacityV2;
}

/**
 * Box keys. They apply to the node they are set on and never inherit.
 *
 * @alpha
 */
export interface IPublisherBoxStyleV2
    extends
        IPublisherBackgroundStyleV2,
        IPublisherPaddingStyleV2,
        IPublisherBorderStyleV2,
        IPublisherCornerStyleV2,
        IPublisherShadowStyleV2 {
    /**
     * Opacity of the whole node, content included.
     */
    opacity?: PublisherOpacityV2;
}

/**
 * Text keys that a page or container passes down to the content inside, unless a widget sets its own.
 *
 * @alpha
 */
export interface IPublisherInheritedTextStyleV2 {
    textStyle?: PublisherTextStyleNameV2;
    textColor?: PublisherColorValueV2;
    /**
     * `justify` applies to text only.
     */
    horizontalAlign?: PublisherHorizontalAlignV2 | "justify";
    verticalAlign?: PublisherVerticalAlignV2;
}

/**
 * @alpha
 */
export interface IPublisherTextStyleV2 extends IPublisherInheritedTextStyleV2 {
    fontSize?: PublisherPxV2;
    /**
     * 1 to 1000.
     */
    fontWeight?: number;
    fontStyle?: "normal" | "italic";
    /**
     * Multiple of the font size.
     */
    lineHeight?: number;
    /**
     * In em.
     */
    letterSpacing?: number;
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
    /**
     * Defaults to `shrink`.
     */
    textOverflow?: "shrink" | "clip" | "ellipsis";
}

/**
 * @remarks
 * Of the text keys, only those of {@link IPublisherInheritedTextStyleV2} change how the page renders;
 * the others are kept and validated.
 *
 * @alpha
 */
export interface IPublisherPageStyleV2
    extends IPublisherBackgroundStyleV2, IPublisherPaddingStyleV2, IPublisherTextStyleV2 {
    /**
     * Default gap of every container on the page.
     */
    gap?: PublisherGapValueV2;
}

/**
 * @remarks
 * Of the text keys, only those of {@link IPublisherInheritedTextStyleV2} change how the container
 * renders; the others are kept and validated.
 *
 * @alpha
 */
export interface IPublisherContainerStyleV2 extends IPublisherBoxStyleV2, IPublisherTextStyleV2 {
    gap?: PublisherGapValueV2;
}

/**
 * @alpha
 */
export interface IPublisherTextWidgetStyleV2 extends IPublisherBoxStyleV2, IPublisherTextStyleV2 {}

/**
 * @alpha
 */
export interface IPublisherImageWidgetStyleV2 extends IPublisherBoxStyleV2 {
    /**
     * Defaults to `contain`.
     */
    fit?: "contain" | "cover" | "fill";
    horizontalAlign?: PublisherHorizontalAlignV2;
    verticalAlign?: PublisherVerticalAlignV2;
}

/**
 * @remarks
 * Each of `chart`, `table` and `headline` applies only while the visualization renders as that kind,
 * so the style survives a switch from a chart to a table.
 *
 * @alpha
 */
export interface IPublisherVisualizationStyleV2 extends IPublisherBoxStyleV2 {
    chart?: IPublisherChartStyleV2;
    table?: IPublisherTableStyleV2;
    headline?: IPublisherHeadlineStyleV2;
}

/**
 * @alpha
 */
export interface IPublisherChartStyleV2 {
    fontSize?: PublisherPxV2;
    textColor?: PublisherColorValueV2;
    axisLineColor?: PublisherColorValueV2;
    /**
     * Color of the axis title.
     */
    axisNameColor?: PublisherColorValueV2;
    axisNameSize?: PublisherPxV2;
    /**
     * Color of the tick labels.
     */
    axisValueColor?: PublisherColorValueV2;
    axisValueSize?: PublisherPxV2;
    gridColor?: PublisherColorValueV2;
    plotLineColor?: PublisherColorValueV2;
    legendColor?: PublisherColorValueV2;
    legendSize?: PublisherPxV2;
    dataLabelColor?: PublisherColorValueV2;
    dataLabelSize?: PublisherPxV2;
}

/**
 * @alpha
 */
export interface IPublisherTableStyleV2 {
    fontSize?: PublisherPxV2;
    rowHeight?: PublisherPxV2;
    gridColor?: PublisherColorValueV2;
    valueColor?: PublisherColorValueV2;
    nullValueColor?: PublisherColorValueV2;
    headerLabelColor?: PublisherColorValueV2;
    headerBackgroundColor?: PublisherColorValueV2;
    totalValueColor?: PublisherColorValueV2;
    totalBackgroundColor?: PublisherColorValueV2;
    subtotalBackgroundColor?: PublisherColorValueV2;
}

/**
 * @alpha
 */
export interface IPublisherHeadlineStyleV2 {
    primaryValueColor?: PublisherColorValueV2;
    primaryValueSize?: PublisherPxV2;
    secondaryValueColor?: PublisherColorValueV2;
    secondaryValueSize?: PublisherPxV2;
    positiveColor?: PublisherColorValueV2;
    negativeColor?: PublisherColorValueV2;
}
