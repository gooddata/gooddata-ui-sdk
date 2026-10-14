// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type FilterContextItem } from "../../dashboard/filterContext.js";

import { type PublisherLayoutNodeV2, isPublisherContainerV2 } from "./layout.js";
import { type IPublisherPageStyleV2 } from "./style.js";
import { isPublisherWidgetV2 } from "./widget.js";

/**
 * @alpha
 */
export const PublisherPageSizesV2 = ["widescreen"] as const;

/**
 * Page size. The widescreen design canvas is 1920 × 1080 px.
 *
 * @alpha
 */
export type PublisherPageSizeV2 = (typeof PublisherPageSizesV2)[number];

/**
 * @alpha
 */
export const DefaultPublisherPageSizeV2: PublisherPageSizeV2 = "widescreen";

/**
 * @alpha
 */
export function isPublisherPageSizeV2(value: unknown): value is PublisherPageSizeV2 {
    return PublisherPageSizesV2.some((size) => size === value);
}

/**
 * Editor hint; it does not change how the page renders.
 *
 * @alpha
 */
export type PublisherPageKindV2 = "cover" | "section" | "content";

/**
 * Content of one page, as a page template stores it.
 *
 * @alpha
 */
export interface IPublisherPageBodyV2 {
    kind?: PublisherPageKindV2;
    pageSize?: PublisherPageSizeV2;
    /**
     * Markdown speaker notes, never drawn on the page.
     */
    notes?: string;
    style?: IPublisherPageStyleV2;
    layout: PublisherLayoutNodeV2;
    filters?: FilterContextItem[];
}

/**
 * Page inside a document.
 *
 * @alpha
 */
export interface IPublisherDocumentPageV2 extends IPublisherPageBodyV2 {
    /**
     * Unique in the document. Matches `[A-Za-z0-9_.-]{1,64}`.
     */
    id: string;
    /**
     * Defaults to `true`. A hidden page is left out of the viewer, exports and page numbers.
     */
    visible?: boolean;
}

/**
 * @alpha
 */
export function isPublisherPageBodyV2(obj: unknown): obj is IPublisherPageBodyV2 {
    if (isEmpty(obj)) {
        return false;
    }
    const { layout } = obj as IPublisherPageBodyV2;
    return isPublisherContainerV2(layout) || isPublisherWidgetV2(layout);
}

/**
 * @alpha
 */
export function isPublisherDocumentPageV2(obj: unknown): obj is IPublisherDocumentPageV2 {
    return isPublisherPageBodyV2(obj) && typeof (obj as IPublisherDocumentPageV2).id === "string";
}
