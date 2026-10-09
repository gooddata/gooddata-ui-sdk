// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

/**
 * Where content sits inside the box that carries it, along one axis.
 *
 * @alpha
 */
export type PublisherContentAlignment = "start" | "center" | "end";

/**
 * Solid color painted behind a section's or page's content.
 *
 * @alpha
 */
export interface IPublisherColorBackground {
    type: "color";

    /**
     * CSS color value. Absolute: document styling states brand colors directly and does not
     * follow the workspace theme.
     */
    color: string;
}

/**
 * Image painted behind a section's or page's content.
 *
 * @alpha
 */
export interface IPublisherImageBackground {
    type: "image";

    /**
     * Local identifier of an image slot in {@link IPublisherPageBody.slots}. Routing the image
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
export type PublisherBackground = IPublisherColorBackground | IPublisherImageBackground;

/**
 * Paint of the box itself. Never affects the geometry of the box or its children —
 * geometry always comes from layout weights.
 *
 * @alpha
 */
export interface IPublisherBoxStyle {
    background?: PublisherBackground;

    /**
     * Corner radius in percent of the page width — the same relative unit the rest of a document page
     * is sized in, so the corners keep their proportion however large the page is rendered.
     * Content reaching into a rounded corner is clipped.
     */
    borderRadius?: number;

    /**
     * Inset of the box's own content, in percent of the page width like
     * {@link IPublisherBoxStyle.borderRadius}. Insets only inward — siblings and the layout
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
export type PublisherHeadingType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Size a paragraph is rendered at. Each size is styled by the matching theme text level
 * (`reports.textStyle.paragraph.largeText` ...).
 *
 * @alpha
 */
export type PublisherParagraphType = "largeText" | "normalText" | "smallText";

/**
 * Size any document text is rendered at.
 *
 * @alpha
 */
export type PublisherTextType = PublisherHeadingType | PublisherParagraphType;

/**
 * All heading sizes, largest first.
 *
 * @alpha
 */
export const PublisherHeadingTypes: PublisherHeadingType[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * All paragraph sizes, largest first.
 *
 * @alpha
 */
export const PublisherParagraphTypes: PublisherParagraphType[] = ["largeText", "normalText", "smallText"];

/**
 * Size a heading slot that states none is rendered at.
 *
 * @alpha
 */
export const DefaultPublisherHeadingType: PublisherHeadingType = "h1";

/**
 * Size a paragraph slot that states none is rendered at.
 *
 * @alpha
 */
export const DefaultPublisherParagraphType: PublisherParagraphType = "normalText";

/**
 * Type-guard testing whether the value is a {@link PublisherHeadingType}.
 *
 * @alpha
 */
export function isPublisherHeadingType(value: unknown): value is PublisherHeadingType {
    return PublisherHeadingTypes.includes(value as PublisherHeadingType);
}

/**
 * Type-guard testing whether the value is a {@link PublisherParagraphType}.
 *
 * @alpha
 */
export function isPublisherParagraphType(value: unknown): value is PublisherParagraphType {
    return PublisherParagraphTypes.includes(value as PublisherParagraphType);
}

/**
 * Styling of a text slot: the paint of its box, plus the ink and placement of the text it owns.
 *
 * @alpha
 */
export interface IPublisherTextStyle extends IPublisherBoxStyle {
    /**
     * CSS color value. Absolute, like {@link IPublisherColorBackground.color}.
     */
    color?: string;

    horizontalAlign?: PublisherContentAlignment;

    verticalAlign?: PublisherContentAlignment;
}

/**
 * Styling of a heading slot.
 *
 * @alpha
 */
export interface IPublisherHeadingStyle extends IPublisherTextStyle {
    /**
     * Defaults to {@link DefaultPublisherHeadingType}. The size owns the semantic typography that goes
     * with it; the rest of the style overrides ink and placement on top of it.
     */
    type?: PublisherHeadingType;
}

/**
 * Styling of a paragraph slot.
 *
 * @alpha
 */
export interface IPublisherParagraphStyle extends IPublisherTextStyle {
    /**
     * Defaults to {@link DefaultPublisherParagraphType}.
     */
    type?: PublisherParagraphType;
}

/**
 * Where the drawn image sits when it does not fill its box, and which part of it is kept when it
 * is cropped to fill one.
 *
 * @alpha
 */
export interface IPublisherImageStyle {
    horizontalAlign?: PublisherContentAlignment;

    verticalAlign?: PublisherContentAlignment;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherColorBackground}.
 *
 * @alpha
 */
export function isPublisherColorBackground(obj: unknown): obj is IPublisherColorBackground {
    return !isEmpty(obj) && (obj as IPublisherColorBackground).type === "color";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherImageBackground}.
 *
 * @alpha
 */
export function isPublisherImageBackground(obj: unknown): obj is IPublisherImageBackground {
    return !isEmpty(obj) && (obj as IPublisherImageBackground).type === "image";
}
