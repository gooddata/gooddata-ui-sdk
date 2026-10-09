// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IDashboardAttributeFilterConfig } from "../dashboard/dashboard.js";
import { type FilterContextItem } from "../dashboard/filterContext.js";

import { type IPublisherPageBody } from "./pageLayout.js";
import { type IPublisherVariableDefinition } from "./variables.js";

/**
 * Page instance embedded in template/document content: a deep clone of a page body
 * plus its own identity.
 *
 * @remarks
 * Cloning a {@link IPublisherPageLayout} into content assigns the localIdentifier and regenerates
 * slot localIdentifiers (with the layout slotIds) so repeated use of one page stays unique.
 * Deliberately carries NO reference back to the source page — later page edits never
 * affect existing templates or documents.
 *
 * @alpha
 */
export interface IPublisherDocumentPage extends IPublisherPageBody {
    /**
     * Identifier unique within the content; stable across template-to-document copy and reordering.
     */
    localIdentifier: string;
}

/**
 * Configuration of a document's content-level attribute filter: the part of a dashboard attribute
 * filter's configuration that documents support.
 *
 * @alpha
 */
export type IPublisherAttributeFilterConfig = Pick<
    IDashboardAttributeFilterConfig,
    "localIdentifier" | "displayAsLabel"
>;

/**
 * Versioned content shared verbatim by document templates and documents.
 *
 * @alpha
 */
export interface IPublisherDocumentContent {
    /**
     * Content model version, for stored-content evolution.
     */
    version: "1";

    /**
     * Ordered pages of the document.
     */
    pages: IPublisherDocumentPage[];

    /**
     * Content-level default filters; pages and slots may extend or override them.
     * The document period is NOT stored here — it is derived from periodStart/periodEnd
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
    attributeFilterConfigs?: IPublisherAttributeFilterConfig[];

    /**
     * Custom variable declarations. Values live on the document
     * ({@link IPublisherDocumentBase.variableValues}).
     */
    variables?: IPublisherVariableDefinition[];

    /**
     * Instructions every AI-written text without instructions of its own is generated with.
     * Supports `{variables}`.
     */
    takeawaysInstruction?: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentContent}.
 *
 * @alpha
 */
export function isPublisherDocumentContentV1(obj: unknown): obj is IPublisherDocumentContent {
    return (
        !isEmpty(obj) &&
        (obj as IPublisherDocumentContent).version === "1" &&
        Array.isArray((obj as IPublisherDocumentContent).pages)
    );
}
