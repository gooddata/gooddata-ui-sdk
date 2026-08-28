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
}

/**
 * Styling of the text a text slot owns.
 *
 * @remarks
 * Overrides the ink and placement of the slot's {@link ReportTextSlotKind} defaults; the kind
 * keeps owning semantic typography (size and weight).
 *
 * @alpha
 */
export interface IReportTextStyle {
    /**
     * CSS color value. Absolute, like {@link IReportColorBackground.color}.
     */
    color?: string;

    horizontalAlign?: ReportContentAlignment;

    verticalAlign?: ReportContentAlignment;
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
