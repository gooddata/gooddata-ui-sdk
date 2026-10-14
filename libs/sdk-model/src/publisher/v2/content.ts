// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IDashboardAttributeFilterConfig } from "../../dashboard/dashboard.js";
import { type FilterContextItem } from "../../dashboard/filterContext.js";
import { type DateFilterGranularity } from "../../dateFilterConfig/index.js";

import { type IPublisherDocumentPageV2, type PublisherPageSizeV2 } from "./page.js";
import { type IPublisherBackgroundStyleV2, type PublisherGapValueV2 } from "./style.js";
import { type IPublisherTakeawayGenerationV2 } from "./widget.js";

/**
 * @alpha
 */
export type PublisherContentVersionV2 = "2";

/**
 * Both ends are inclusive.
 *
 * @alpha
 */
export interface IPublisherAbsolutePeriodV2 {
    type: "absolute";
    granularity: "GDC.time.date";
    /**
     * `YYYY-MM-DD`.
     */
    from: string;
    /**
     * `YYYY-MM-DD`.
     */
    to: string;
}

/**
 * Both ends are inclusive.
 *
 * @alpha
 */
export interface IPublisherRelativePeriodV2 {
    type: "relative";
    granularity: DateFilterGranularity;
    /**
     * Offset in `granularity` units from the current one, for example `-1`.
     */
    from: number;
    to: number;
}

/**
 * Reported period, in the dashboard date filter grammar without a dataset.
 *
 * @alpha
 */
export type PublisherPeriodV2 = IPublisherAbsolutePeriodV2 | IPublisherRelativePeriodV2;

/**
 * @alpha
 */
export function isPublisherAbsolutePeriodV2(obj: unknown): obj is IPublisherAbsolutePeriodV2 {
    return !isEmpty(obj) && (obj as IPublisherAbsolutePeriodV2).type === "absolute";
}

/**
 * @alpha
 */
export function isPublisherRelativePeriodV2(obj: unknown): obj is IPublisherRelativePeriodV2 {
    return !isEmpty(obj) && (obj as IPublisherRelativePeriodV2).type === "relative";
}

/**
 * @alpha
 */
export interface IPublisherDocumentDefaultsV2 {
    /**
     * Applies to every page without its own `pageSize`.
     */
    pageSize?: PublisherPageSizeV2;
    takeaway?: {
        /**
         * Combined with each takeaway widget's own `generation`.
         */
        generation?: IPublisherTakeawayGenerationV2;
    };
    /**
     * Document templates only. A document stores its period on the entity.
     */
    period?: PublisherPeriodV2;
}

/**
 * Style of the area behind the pages. Exports ignore it.
 *
 * @alpha
 */
export interface IPublisherDocumentStyleV2 extends IPublisherBackgroundStyleV2 {
    /**
     * Space between pages in the viewer and the editor.
     */
    gap?: PublisherGapValueV2;
}

/**
 * Named group of pages.
 *
 * @alpha
 */
export interface IPublisherSectionV2 {
    /**
     * Unique in the document. Matches `[A-Za-z0-9_.-]{1,64}`.
     */
    id: string;
    title?: string;
    description?: string;
    pages: IPublisherDocumentPageV2[];
}

/**
 * Keys shared by both shapes of document content.
 *
 * @alpha
 */
export interface IPublisherDocumentContentBaseV2 {
    defaults?: IPublisherDocumentDefaultsV2;
    /**
     * Date filters name their `dataSet`. At most one filter per attribute or date dataset.
     */
    filters?: FilterContextItem[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    style?: IPublisherDocumentStyleV2;
    /**
     * Overrides the workspace locale for this document, for example `de-DE`.
     */
    locale?: string;
    /**
     * Overrides the workspace format locale used for dates, for example `de-DE`.
     */
    formatLocale?: string;
}

/**
 * Document content stored as a flat list of pages.
 *
 * @alpha
 */
export interface IPublisherDocumentPagesContentV2 extends IPublisherDocumentContentBaseV2 {
    pages: IPublisherDocumentPageV2[];
    sections?: never;
}

/**
 * Document content stored as sections of pages.
 *
 * @alpha
 */
export interface IPublisherDocumentSectionsContentV2 extends IPublisherDocumentContentBaseV2 {
    sections: IPublisherSectionV2[];
    pages?: never;
}

/**
 * Content of a document or a document template. It holds `pages` or `sections`, never both.
 *
 * @alpha
 */
export type PublisherDocumentContentV2 =
    | IPublisherDocumentPagesContentV2
    | IPublisherDocumentSectionsContentV2;

/**
 * @alpha
 */
export function isPublisherDocumentPagesContentV2(obj: unknown): obj is IPublisherDocumentPagesContentV2 {
    if (isEmpty(obj)) {
        return false;
    }
    const { pages, sections } = obj as IPublisherDocumentPagesContentV2;
    return Array.isArray(pages) && sections === undefined;
}

/**
 * @alpha
 */
export function isPublisherDocumentSectionsContentV2(
    obj: unknown,
): obj is IPublisherDocumentSectionsContentV2 {
    if (isEmpty(obj)) {
        return false;
    }
    const { sections, pages } = obj as IPublisherDocumentSectionsContentV2;
    return Array.isArray(sections) && pages === undefined;
}
