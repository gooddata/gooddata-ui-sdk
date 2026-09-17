// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

/**
 * Where content sits inside the box that carries it, along one axis.
 *
 * @alpha
 */
export type ReportContentAlignment = "start" | "center" | "end";

/**
 * Solid color painted behind a section's or page's content.
 *
 * @alpha
 */
export interface IReportColorBackground {
    type: "color";

    /**
     * CSS color value. Absolute: report styling states brand colors directly and does not
     * follow the workspace theme.
     */
    color: string;
}

/**
 * Image painted behind a section's or page's content.
 *
 * @alpha
 */
export interface IReportImageBackground {
    type: "image";

    /**
     * Local identifier of an image slot in {@link IReportPageBody.slots}. Routing the image
     * through a slot keeps it template-fillable and gives it the slot's placeholder metadata.
     * A reference that is missing or resolves to a non-image slot paints no background.
     */
    slotId: string;
}

/**
 * What a section or page paints behind its content.
 *
 * @alpha
 */
export type ReportBackground = IReportColorBackground | IReportImageBackground;

/**
 * Paint of the box itself. Never affects the geometry of the box or its children —
 * geometry always comes from layout weights.
 *
 * @alpha
 */
export interface IReportBoxStyle {
    background?: ReportBackground;

    /**
     * Corner radius in percent of the page width — the same relative unit the rest of a report page
     * is sized in, so the corners keep their proportion however large the page is rendered.
     * Content reaching into a rounded corner is clipped.
     */
    borderRadius?: number;

    /**
     * Inset of the box's own content, in percent of the page width like
     * {@link IReportBoxStyle.borderRadius}. Insets only inward — siblings and the layout
     * gaps around the box are untouched. A box that paints a background usually wants one;
     * a full-bleed box (an image-backed cover) wants none, which is why no default exists.
     */
    padding?: number;
}

/**
 * Size a heading is rendered at. Each size is styled by the matching theme text level
 * (`reports.textStyle.heading.h1` ...).
 *
 * @alpha
 */
export type ReportHeadingType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Size a paragraph is rendered at. Each size is styled by the matching theme text level
 * (`reports.textStyle.paragraph.largeText` ...).
 *
 * @alpha
 */
export type ReportParagraphType = "largeText" | "normalText" | "smallText";

/**
 * Size any report text is rendered at.
 *
 * @alpha
 */
export type ReportTextType = ReportHeadingType | ReportParagraphType;

/**
 * All heading sizes, largest first.
 *
 * @alpha
 */
export const ReportHeadingTypes: ReportHeadingType[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * All paragraph sizes, largest first.
 *
 * @alpha
 */
export const ReportParagraphTypes: ReportParagraphType[] = ["largeText", "normalText", "smallText"];

/**
 * Size a heading slot that states none is rendered at.
 *
 * @alpha
 */
export const DefaultReportHeadingType: ReportHeadingType = "h1";

/**
 * Size a paragraph slot that states none is rendered at.
 *
 * @alpha
 */
export const DefaultReportParagraphType: ReportParagraphType = "normalText";

/**
 * Type-guard testing whether the value is a {@link ReportHeadingType}.
 *
 * @alpha
 */
export function isReportHeadingType(value: unknown): value is ReportHeadingType {
    return ReportHeadingTypes.includes(value as ReportHeadingType);
}

/**
 * Type-guard testing whether the value is a {@link ReportParagraphType}.
 *
 * @alpha
 */
export function isReportParagraphType(value: unknown): value is ReportParagraphType {
    return ReportParagraphTypes.includes(value as ReportParagraphType);
}

/**
 * Styling of a text slot: the paint of its box, plus the ink and placement of the text it owns.
 *
 * @alpha
 */
export interface IReportTextStyle extends IReportBoxStyle {
    /**
     * CSS color value. Absolute, like {@link IReportColorBackground.color}.
     */
    color?: string;

    horizontalAlign?: ReportContentAlignment;

    verticalAlign?: ReportContentAlignment;
}

/**
 * Styling of a heading slot.
 *
 * @alpha
 */
export interface IReportHeadingStyle extends IReportTextStyle {
    /**
     * Defaults to {@link DefaultReportHeadingType}. The size owns the semantic typography that goes
     * with it; the rest of the style overrides ink and placement on top of it.
     */
    type?: ReportHeadingType;
}

/**
 * Styling of a paragraph slot.
 *
 * @alpha
 */
export interface IReportParagraphStyle extends IReportTextStyle {
    /**
     * Defaults to {@link DefaultReportParagraphType}.
     */
    type?: ReportParagraphType;
}

/**
 * Where the drawn image sits when it does not fill its box, and which part of it is kept when it
 * is cropped to fill one.
 *
 * @alpha
 */
export interface IReportImageStyle {
    horizontalAlign?: ReportContentAlignment;

    verticalAlign?: ReportContentAlignment;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportColorBackground}.
 *
 * @alpha
 */
export function isReportColorBackground(obj: unknown): obj is IReportColorBackground {
    return !isEmpty(obj) && (obj as IReportColorBackground).type === "color";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportImageBackground}.
 *
 * @alpha
 */
export function isReportImageBackground(obj: unknown): obj is IReportImageBackground {
    return !isEmpty(obj) && (obj as IReportImageBackground).type === "image";
}
