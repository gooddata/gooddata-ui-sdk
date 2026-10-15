// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IDashboardAttributeFilterConfig } from "../../dashboard/dashboard.js";
import { type FilterContextItem } from "../../dashboard/filterContext.js";

import { type IPublisherPageBodyV1 } from "./pageTemplate.js";
import { type IPublisherVariableDefinitionV1 } from "./variables.js";

/**
 * Page instance embedded in template/document content: a deep clone of a page body
 * plus its own identity.
 *
 * @remarks
 * Cloning a {@link IPublisherPageTemplateV1} into content assigns the localIdentifier and regenerates
 * slot localIdentifiers (with the layout slotIds) so repeated use of one page stays unique.
 * Deliberately carries NO reference back to the source page — later page edits never
 * affect existing templates or documents.
 *
 * @alpha
 */
export interface IPublisherDocumentPageV1 extends IPublisherPageBodyV1 {
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
export type IPublisherAttributeFilterConfigV1 = Pick<
    IDashboardAttributeFilterConfig,
    "localIdentifier" | "displayAsLabel"
>;

/**
 * Versioned content shared verbatim by document templates and documents.
 *
 * @alpha
 */
export interface IPublisherDocumentContentV1 {
    /**
     * Content model version, for stored-content evolution.
     */
    version: "1";

    /**
     * Ordered pages of the document.
     */
    pages: IPublisherDocumentPageV1[];

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
    attributeFilterConfigs?: IPublisherAttributeFilterConfigV1[];

    /**
     * Custom variable declarations. Values live on the document
     * ({@link IPublisherDocumentBaseV1.variableValues}).
     */
    variables?: IPublisherVariableDefinitionV1[];

    /**
     * Instructions every AI-written text without instructions of its own is generated with.
     * Supports `{variables}`.
     */
    takeawaysInstruction?: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentContentV1}.
 *
 * @alpha
 */
export function isPublisherDocumentContentV1(obj: unknown): obj is IPublisherDocumentContentV1 {
    return (
        !isEmpty(obj) &&
        (obj as IPublisherDocumentContentV1).version === "1" &&
        Array.isArray((obj as IPublisherDocumentContentV1).pages)
    );
}
