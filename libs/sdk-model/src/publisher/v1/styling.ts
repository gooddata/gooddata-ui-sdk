// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

/**
 * Where content sits inside the box that carries it, along one axis.
 *
 * @alpha
 */
export type PublisherContentAlignmentV1 = "start" | "center" | "end";

/**
 * Solid color painted behind a section's or page's content.
 *
 * @alpha
 */
export interface IPublisherColorBackgroundV1 {
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
export interface IPublisherImageBackgroundV1 {
    type: "image";

    /**
     * Local identifier of an image slot in {@link IPublisherPageBodyV1.slots}. Routing the image
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
export type PublisherBackgroundV1 = IPublisherColorBackgroundV1 | IPublisherImageBackgroundV1;

/**
 * Paint of the box itself. Never affects the geometry of the box or its children —
 * geometry always comes from layout weights.
 *
 * @alpha
 */
export interface IPublisherBoxStyleV1 {
    background?: PublisherBackgroundV1;

    /**
     * Corner radius in percent of the page width — the same relative unit the rest of a document page
     * is sized in, so the corners keep their proportion however large the page is rendered.
     * Content reaching into a rounded corner is clipped.
     */
    borderRadius?: number;

    /**
     * Inset of the box's own content, in percent of the page width like
     * {@link IPublisherBoxStyleV1.borderRadius}. Insets only inward — siblings and the layout
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
export type PublisherHeadingTypeV1 = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Size a paragraph is rendered at. Each size is styled by the matching theme text level
 * (`reports.textStyle.paragraph.largeText` ...).
 *
 * @alpha
 */
export type PublisherParagraphTypeV1 = "largeText" | "normalText" | "smallText";

/**
 * Size any document text is rendered at.
 *
 * @alpha
 */
export type PublisherTextTypeV1 = PublisherHeadingTypeV1 | PublisherParagraphTypeV1;

/**
 * All heading sizes, largest first.
 *
 * @alpha
 */
export const PublisherHeadingTypesV1: PublisherHeadingTypeV1[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * All paragraph sizes, largest first.
 *
 * @alpha
 */
export const PublisherParagraphTypesV1: PublisherParagraphTypeV1[] = ["largeText", "normalText", "smallText"];

/**
 * Size a heading slot that states none is rendered at.
 *
 * @alpha
 */
export const DefaultPublisherHeadingTypeV1: PublisherHeadingTypeV1 = "h1";

/**
 * Size a paragraph slot that states none is rendered at.
 *
 * @alpha
 */
export const DefaultPublisherParagraphTypeV1: PublisherParagraphTypeV1 = "normalText";

/**
 * Type-guard testing whether the value is a {@link PublisherHeadingTypeV1}.
 *
 * @alpha
 */
export function isPublisherHeadingTypeV1(value: unknown): value is PublisherHeadingTypeV1 {
    return PublisherHeadingTypesV1.includes(value as PublisherHeadingTypeV1);
}

/**
 * Type-guard testing whether the value is a {@link PublisherParagraphTypeV1}.
 *
 * @alpha
 */
export function isPublisherParagraphTypeV1(value: unknown): value is PublisherParagraphTypeV1 {
    return PublisherParagraphTypesV1.includes(value as PublisherParagraphTypeV1);
}

/**
 * Styling of a text slot: the paint of its box, plus the ink and placement of the text it owns.
 *
 * @alpha
 */
export interface IPublisherTextStyleV1 extends IPublisherBoxStyleV1 {
    /**
     * CSS color value. Absolute, like {@link IPublisherColorBackgroundV1.color}.
     */
    color?: string;

    horizontalAlign?: PublisherContentAlignmentV1;

    verticalAlign?: PublisherContentAlignmentV1;
}

/**
 * Styling of a heading slot.
 *
 * @alpha
 */
export interface IPublisherHeadingStyleV1 extends IPublisherTextStyleV1 {
    /**
     * Defaults to {@link DefaultPublisherHeadingTypeV1}. The size owns the semantic typography that goes
     * with it; the rest of the style overrides ink and placement on top of it.
     */
    type?: PublisherHeadingTypeV1;
}

/**
 * Styling of a paragraph slot.
 *
 * @alpha
 */
export interface IPublisherParagraphStyleV1 extends IPublisherTextStyleV1 {
    /**
     * Defaults to {@link DefaultPublisherParagraphTypeV1}.
     */
    type?: PublisherParagraphTypeV1;
}

/**
 * Where the drawn image sits when it does not fill its box, and which part of it is kept when it
 * is cropped to fill one.
 *
 * @alpha
 */
export interface IPublisherImageStyleV1 {
    horizontalAlign?: PublisherContentAlignmentV1;

    verticalAlign?: PublisherContentAlignmentV1;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherColorBackgroundV1}.
 *
 * @alpha
 */
export function isPublisherColorBackgroundV1(obj: unknown): obj is IPublisherColorBackgroundV1 {
    return !isEmpty(obj) && (obj as IPublisherColorBackgroundV1).type === "color";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherImageBackgroundV1}.
 *
 * @alpha
 */
export function isPublisherImageBackgroundV1(obj: unknown): obj is IPublisherImageBackgroundV1 {
    return !isEmpty(obj) && (obj as IPublisherImageBackgroundV1).type === "image";
}
