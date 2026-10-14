// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type FilterContextItem, type IDashboardFilterReference } from "../../dashboard/filterContext.js";

import {
    type IPublisherImageWidgetStyleV2,
    type IPublisherTextStyleV2,
    type IPublisherTextWidgetStyleV2,
    type IPublisherVisualizationStyleV2,
    type PublisherImageSourceV2,
    type PublisherTextStyleNameV2,
} from "./style.js";

/**
 * @alpha
 */
export const PublisherWidgetTypesV2 = [
    "title",
    "heading",
    "text",
    "image",
    "visualization",
    "takeaway",
] as const;

/**
 * @alpha
 */
export type PublisherWidgetTypeV2 = (typeof PublisherWidgetTypesV2)[number];

/**
 * @alpha
 */
export interface IPublisherWidgetPlaceholderV2 {
    hint?: string;
    required?: boolean;
}

/**
 * @remarks
 * Empty content is an absent key; `""` and `null` are invalid.
 *
 * @alpha
 */
export interface IPublisherWidgetBaseV2 {
    type: PublisherWidgetTypeV2;
    /**
     * Unique within its page. Copying a page keeps widget ids as written. Matches `[A-Za-z0-9_.-]{1,64}`.
     */
    id: string;
    /**
     * Share of the parent's main axis, greater than 0. Defaults to 1.
     */
    proportion?: number;
    placeholder?: IPublisherWidgetPlaceholderV2;
    /**
     * Enforced by the editor, never checked on write.
     */
    locked?: boolean;
}

/**
 * Page title: the PowerPoint slide title and the page name for screen readers.
 *
 * @remarks
 * At most one per page. A page without one uses its first heading as the slide title.
 *
 * @alpha
 */
export interface IPublisherTitleWidgetV2 extends IPublisherWidgetBaseV2 {
    type: "title";
    /**
     * Inline markdown only: strong, emphasis, highlight, strike, links and line breaks.
     */
    markdown?: string;
    /**
     * `textStyle` defaults to `title`.
     */
    style?: IPublisherTextWidgetStyleV2;
}

/**
 * @alpha
 */
export type PublisherHeadingLevelV2 = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * @alpha
 */
export interface IPublisherHeadingWidgetV2 extends IPublisherWidgetBaseV2 {
    type: "heading";
    /**
     * Inline markdown only.
     */
    markdown?: string;
    /**
     * Outline level below the page title, independent of the text style. Defaults to 1.
     */
    level?: PublisherHeadingLevelV2;
    /**
     * `textStyle` defaults to {@link publisherHeadingDefaultTextStyleV2} of the level.
     */
    style?: IPublisherTextWidgetStyleV2;
}

/**
 * @alpha
 */
export interface IPublisherTextWidgetV2 extends IPublisherWidgetBaseV2 {
    type: "text";
    /**
     * Full markdown: paragraphs, lists, quotes and headings.
     */
    markdown?: string;
    /**
     * Page furniture such as page numbers: kept out of the accessibility tree, PDF tags and AI context.
     */
    decorative?: boolean;
    /**
     * `textStyle` defaults to `normalText`.
     */
    style?: IPublisherTextWidgetStyleV2;
}

/**
 * @alpha
 */
export interface IPublisherImageWidgetV2 extends IPublisherWidgetBaseV2 {
    type: "image";
    source?: PublisherImageSourceV2;
    altText?: string;
    decorative?: boolean;
    style?: IPublisherImageWidgetStyleV2;
}

/**
 * @alpha
 */
export interface IPublisherVisualizationRefV2 {
    identifier: string;
    type: "insight";
}

/**
 * @alpha
 */
export interface IPublisherDataSetRefV2 {
    identifier: string;
    type: "dataSet";
}

/**
 * @alpha
 */
export interface IPublisherWidgetTitleV2 {
    /**
     * Defaults to `true`.
     */
    visible?: boolean;
    /**
     * May contain text variables. A visible title without text shows the visualization's own title.
     */
    text?: string;
    style?: IPublisherTextStyleV2;
}

/**
 * @alpha
 */
export interface IPublisherAxisDisplayV2 {
    visible?: boolean;
    /**
     * The axis title.
     */
    name?: { visible?: boolean; position?: "low" | "middle" | "high" };
    /**
     * The tick labels. Rotation is in degrees, -90 to 90.
     */
    values?: { visible?: boolean; rotation?: number };
    min?: number;
    max?: number;
}

/**
 * Overrides of the saved visualization's display settings.
 *
 * @remarks
 * A key left out keeps the saved visualization's value. A key the visualization type does not
 * support is ignored.
 *
 * @alpha
 */
export interface IPublisherVisualizationDisplayV2 {
    legend?: { visible?: boolean; position?: "auto" | "top" | "bottom" | "left" | "right" };
    xAxis?: IPublisherAxisDisplayV2;
    yAxis?: IPublisherAxisDisplayV2;
    secondaryYAxis?: IPublisherAxisDisplayV2;
    gridlines?: { visible?: boolean };
    dataLabels?: { visible?: boolean | "auto" };
    dataPoints?: { visible?: boolean | "auto" };
}

/**
 * @alpha
 */
export interface IPublisherVisualizationWidgetV2 extends IPublisherWidgetBaseV2 {
    type: "visualization";
    visualization?: IPublisherVisualizationRefV2;
    title?: IPublisherWidgetTitleV2;
    /**
     * Defaults to the visualization's description.
     */
    altText?: string;
    /**
     * The date dataset that the document period filters.
     */
    dateDataSet?: IPublisherDataSetRefV2;
    ignoreDocumentPeriod?: boolean;
    filters?: FilterContextItem[];
    /**
     * May name a filter the document no longer has.
     */
    ignoreDocumentFilters?: IDashboardFilterReference[];
    display?: IPublisherVisualizationDisplayV2;
    style?: IPublisherVisualizationStyleV2;
}

/**
 * @alpha
 */
export interface IPublisherTakeawayGenerationV2 {
    /**
     * Appended to the preset instructions. Sent together with the document's takeaway instructions;
     * the widget's instructions win on a clash.
     */
    instructions?: string;
    /**
     * What the AI reads.
     */
    context?: {
        /**
         * Widget ids on the same page. Defaults to every visualization on the page.
         */
        widgets?: string[];
        /**
         * Defaults to `true`.
         */
        pageTitle?: boolean;
        /**
         * Filters and period. Defaults to `true`.
         */
        filters?: boolean;
        /**
         * Defaults to `false`.
         */
        otherPages?: boolean;
    };
}

/**
 * @alpha
 */
export interface IPublisherTakeawayWidgetV2 extends IPublisherWidgetBaseV2 {
    type: "takeaway";
    /**
     * Text defaults to a localized "Takeaway".
     */
    title?: IPublisherWidgetTitleV2;
    /**
     * The generated or written text.
     */
    markdown?: string;
    generation?: IPublisherTakeawayGenerationV2;
    style?: IPublisherTextWidgetStyleV2;
}

/**
 * @alpha
 */
export type PublisherWidgetV2 =
    | IPublisherTitleWidgetV2
    | IPublisherHeadingWidgetV2
    | IPublisherTextWidgetV2
    | IPublisherImageWidgetV2
    | IPublisherVisualizationWidgetV2
    | IPublisherTakeawayWidgetV2;

/**
 * Text style a heading uses when its style sets none: `h(n+1)` for level n, `h6` for levels 5 and 6.
 *
 * @alpha
 */
export function publisherHeadingDefaultTextStyleV2(
    level: PublisherHeadingLevelV2 = 1,
): Extract<PublisherTextStyleNameV2, "h2" | "h3" | "h4" | "h5" | "h6"> {
    switch (level) {
        case 1:
            return "h2";
        case 2:
            return "h3";
        case 3:
            return "h4";
        case 4:
            return "h5";
        case 5:
        case 6:
            return "h6";
    }
}

/**
 * @alpha
 */
export function isPublisherWidgetV2(obj: unknown): obj is PublisherWidgetV2 {
    if (isEmpty(obj)) {
        return false;
    }
    const { type } = obj as PublisherWidgetV2;
    return PublisherWidgetTypesV2.some((widgetType) => widgetType === type);
}

/**
 * @alpha
 */
export function isPublisherTitleWidgetV2(obj: unknown): obj is IPublisherTitleWidgetV2 {
    return !isEmpty(obj) && (obj as IPublisherTitleWidgetV2).type === "title";
}

/**
 * @alpha
 */
export function isPublisherHeadingWidgetV2(obj: unknown): obj is IPublisherHeadingWidgetV2 {
    return !isEmpty(obj) && (obj as IPublisherHeadingWidgetV2).type === "heading";
}

/**
 * @alpha
 */
export function isPublisherTextWidgetV2(obj: unknown): obj is IPublisherTextWidgetV2 {
    return !isEmpty(obj) && (obj as IPublisherTextWidgetV2).type === "text";
}

/**
 * @alpha
 */
export function isPublisherImageWidgetV2(obj: unknown): obj is IPublisherImageWidgetV2 {
    return !isEmpty(obj) && (obj as IPublisherImageWidgetV2).type === "image";
}

/**
 * @alpha
 */
export function isPublisherVisualizationWidgetV2(obj: unknown): obj is IPublisherVisualizationWidgetV2 {
    return !isEmpty(obj) && (obj as IPublisherVisualizationWidgetV2).type === "visualization";
}

/**
 * @alpha
 */
export function isPublisherTakeawayWidgetV2(obj: unknown): obj is IPublisherTakeawayWidgetV2 {
    return !isEmpty(obj) && (obj as IPublisherTakeawayWidgetV2).type === "takeaway";
}
