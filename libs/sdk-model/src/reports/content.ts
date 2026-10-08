// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IDashboardAttributeFilterConfig } from "../dashboard/dashboard.js";
import { type FilterContextItem } from "../dashboard/filterContext.js";

import { type IReportPageBody } from "./pageLayout.js";
import { type IReportVariableDefinition } from "./variables.js";

/**
 * Page instance embedded in template/report content: a deep clone of a page body
 * plus its own identity.
 *
 * @remarks
 * Cloning a {@link IReportPageLayout} into content assigns the localIdentifier and regenerates
 * slot localIdentifiers (with the layout slotIds) so repeated use of one page stays unique.
 * Deliberately carries NO reference back to the source page — later page edits never
 * affect existing templates or reports.
 *
 * @alpha
 */
export interface IReportContentPage extends IReportPageBody {
    /**
     * Identifier unique within the content; stable across template-to-report copy and reordering.
     */
    localIdentifier: string;
}

/**
 * Configuration of a report's content-level attribute filter: the part of a dashboard attribute
 * filter's configuration that reports support.
 *
 * @alpha
 */
export type IReportAttributeFilterConfig = Pick<
    IDashboardAttributeFilterConfig,
    "localIdentifier" | "displayAsLabel"
>;

/**
 * Versioned content shared verbatim by report templates and reports.
 *
 * @alpha
 */
export interface IReportContent {
    /**
     * Content model version, for stored-content evolution.
     */
    version: "1";

    /**
     * Ordered pages of the document.
     */
    pages: IReportContentPage[];

    /**
     * Content-level default filters; pages and slots may extend or override them.
     * The report period is NOT stored here — it is derived from periodStart/periodEnd
     * at execution time.
     */
    filters?: FilterContextItem[];

    /**
     * Configuration of the content-level attribute filters, keyed by the filter's local identifier.
     *
     * @remarks
     * A filter with a `displayAsLabel` must be stored on the attribute's primary label: its selection
     * is read as primary-label values and shown by `displayAsLabel`.
     */
    attributeFilterConfigs?: IReportAttributeFilterConfig[];

    /**
     * Custom variable declarations. Values live on the report
     * ({@link IReportBase.variableValues}).
     */
    variables?: IReportVariableDefinition[];

    /**
     * Instructions every AI-written text without instructions of its own is generated with.
     * Supports `{variables}`.
     */
    takeawaysInstruction?: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportContent}.
 *
 * @alpha
 */
export function isReportContentV1(obj: unknown): obj is IReportContent {
    return (
        !isEmpty(obj) &&
        (obj as IReportContent).version === "1" &&
        Array.isArray((obj as IReportContent).pages)
    );
}
