// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAuditableDates, type IAuditableUsers } from "../base/metadata.js";
import { type ObjRef, isObjRef } from "../objRef/index.js";

import { type IPublisherDocumentContent } from "./content.js";
import { type PublisherDateString } from "./variables.js";

/**
 * Payload for creating or updating a document template.
 *
 * @alpha
 */
export interface IPublisherDocumentTemplateDefinition {
    type: "reportTemplate";

    /**
     * Present when updating an existing template.
     */
    ref?: ObjRef;

    title: string;

    description?: string;

    tags?: string[];

    content: IPublisherDocumentContent;
}

/**
 * Document template metadata object.
 *
 * @alpha
 */
export interface IPublisherDocumentTemplate
    extends IPublisherDocumentTemplateDefinition, IAuditableDates, IAuditableUsers {
    ref: ObjRef;

    /**
     * When true, the object comes from a parent workspace and is not editable
     * in the current workspace.
     */
    isLocked?: boolean;
}

/**
 * Fields shared by document definitions and persisted documents.
 *
 * @alpha
 */
export interface IPublisherDocumentBase {
    title: string;

    description?: string;

    tags?: string[];

    /**
     * Reported period start, ISO 8601 date (YYYY-MM-DD), inclusive.
     *
     * @remarks
     * At execution time the period materializes as an absolute date filter on each
     * visualization slot's dateDataSet (lowest precedence, per-slot opt-out via
     * ignoreReportPeriod). Also available as `{periodStart}` in text.
     */
    periodStart: PublisherDateString;

    /**
     * Reported period end, ISO 8601 date (YYYY-MM-DD), inclusive.
     */
    periodEnd: PublisherDateString;

    /**
     * Content of the document. When created from a template the content is deep-copied
     * and NO reference to the template is kept — the document stays frozen while pages
     * and templates evolve.
     */
    content: IPublisherDocumentContent;

    /**
     * Values for variables declared in content.variables, keyed by variable name.
     */
    variableValues?: Record<string, string>;
}

/**
 * Payload for creating or updating a document.
 *
 * @alpha
 */
export interface IPublisherDocumentDefinition extends IPublisherDocumentBase {
    type: "report";

    /**
     * Present when updating an existing document.
     */
    ref?: ObjRef;
}

/**
 * Document metadata object.
 *
 * @alpha
 */
export interface IPublisherDocument extends IPublisherDocumentDefinition, IAuditableDates, IAuditableUsers {
    ref: ObjRef;

    /**
     * When true, the object comes from a parent workspace and is not editable
     * in the current workspace.
     */
    isLocked?: boolean;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentTemplateDefinition}.
 *
 * @alpha
 */
export function isPublisherDocumentTemplateDefinition(
    obj: unknown,
): obj is IPublisherDocumentTemplateDefinition {
    return !isEmpty(obj) && (obj as IPublisherDocumentTemplateDefinition).type === "reportTemplate";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentTemplate}.
 *
 * @alpha
 */
export function isPublisherDocumentTemplate(obj: unknown): obj is IPublisherDocumentTemplate {
    return isPublisherDocumentTemplateDefinition(obj) && isObjRef((obj as IPublisherDocumentTemplate).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentDefinition}.
 *
 * @alpha
 */
export function isPublisherDocumentDefinition(obj: unknown): obj is IPublisherDocumentDefinition {
    return !isEmpty(obj) && (obj as IPublisherDocumentDefinition).type === "report";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocument}.
 *
 * @alpha
 */
export function isPublisherDocument(obj: unknown): obj is IPublisherDocument {
    return isPublisherDocumentDefinition(obj) && isObjRef((obj as IPublisherDocument).ref);
}
