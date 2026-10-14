// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAuditableDates, type IAuditableUsers } from "../../base/metadata.js";
import { type ObjRef, isObjRef } from "../../objRef/index.js";

import { type IPublisherDocumentContentV1 } from "./content.js";
import { type PublisherDateStringV1 } from "./variables.js";

/**
 * Payload for creating or updating a document template.
 *
 * @alpha
 */
export interface IPublisherDocumentTemplateDefinitionV1 {
    type: "reportTemplate";

    /**
     * Present when updating an existing template.
     */
    ref?: ObjRef;

    title: string;

    description?: string;

    tags?: string[];

    content: IPublisherDocumentContentV1;
}

/**
 * Document template metadata object.
 *
 * @alpha
 */
export interface IPublisherDocumentTemplateV1
    extends IPublisherDocumentTemplateDefinitionV1, IAuditableDates, IAuditableUsers {
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
export interface IPublisherDocumentBaseV1 {
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
    periodStart: PublisherDateStringV1;

    /**
     * Reported period end, ISO 8601 date (YYYY-MM-DD), inclusive.
     */
    periodEnd: PublisherDateStringV1;

    /**
     * Content of the document. When created from a template the content is deep-copied
     * and NO reference to the template is kept — the document stays frozen while pages
     * and templates evolve.
     */
    content: IPublisherDocumentContentV1;

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
export interface IPublisherDocumentDefinitionV1 extends IPublisherDocumentBaseV1 {
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
export interface IPublisherDocumentV1
    extends IPublisherDocumentDefinitionV1, IAuditableDates, IAuditableUsers {
    ref: ObjRef;

    /**
     * When true, the object comes from a parent workspace and is not editable
     * in the current workspace.
     */
    isLocked?: boolean;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentTemplateDefinitionV1}.
 *
 * @alpha
 */
export function isPublisherDocumentTemplateDefinitionV1(
    obj: unknown,
): obj is IPublisherDocumentTemplateDefinitionV1 {
    return !isEmpty(obj) && (obj as IPublisherDocumentTemplateDefinitionV1).type === "reportTemplate";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentTemplateV1}.
 *
 * @alpha
 */
export function isPublisherDocumentTemplateV1(obj: unknown): obj is IPublisherDocumentTemplateV1 {
    return (
        isPublisherDocumentTemplateDefinitionV1(obj) && isObjRef((obj as IPublisherDocumentTemplateV1).ref)
    );
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentDefinitionV1}.
 *
 * @alpha
 */
export function isPublisherDocumentDefinitionV1(obj: unknown): obj is IPublisherDocumentDefinitionV1 {
    return !isEmpty(obj) && (obj as IPublisherDocumentDefinitionV1).type === "report";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherDocumentV1}.
 *
 * @alpha
 */
export function isPublisherDocumentV1(obj: unknown): obj is IPublisherDocumentV1 {
    return isPublisherDocumentDefinitionV1(obj) && isObjRef((obj as IPublisherDocumentV1).ref);
}
