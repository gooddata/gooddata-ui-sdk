// (C) 2026 GoodData Corporation

import {
    type IAuditableDates,
    type IAuditableUsers,
    type IPublisherDocumentDefinitionV1,
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV1,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherDocumentTemplateV1,
    type IPublisherDocumentTemplateV2,
    type IPublisherDocumentV1,
    type IPublisherDocumentV2,
    type IPublisherPageTemplateDefinitionV1,
    type IPublisherPageTemplateDefinitionV2,
    type IPublisherPageTemplateV1,
    type IPublisherPageTemplateV2,
    type ObjRef,
} from "@gooddata/sdk-model";

import { type PublisherContentNotSupportedError } from "../../errors/index.js";
import { type IExportResult } from "../execution/index.js";

/**
 * Options for exporting a document to PDF.
 *
 * @alpha
 */
export interface IPublisherDocumentExportPdfOptions {
    /**
     * File name for the export, without the extension.
     */
    filename?: string;

    /**
     * Override the default export result polling timeout (in milliseconds).
     *
     * @remarks
     * If not specified, there is still a default timeout applied.
     */
    timeout?: number;
}

/**
 * Service for managing page templates, document templates and documents.
 *
 * @remarks
 * Page templates returned by this service include the default page templates shipped with the
 * product ({@link @gooddata/sdk-model#DefaultPublisherPageTemplates}). Default page templates carry
 * `isDefault: true`, are never persisted on the backend, and reject update and delete.
 *
 * @alpha
 */
export interface IWorkspacePublisherService {
    //
    // Page templates
    //

    /**
     * Get the list of page templates available in the workspace, default page templates first.
     */
    getPageTemplates(): Promise<IPublisherPageTemplateV1[]>;

    /**
     * Get a single page template by its reference.
     */
    getPageTemplate(ref: ObjRef): Promise<IPublisherPageTemplateV1>;

    /**
     * Create a new page template.
     */
    createPageTemplate(page: IPublisherPageTemplateDefinitionV1): Promise<IPublisherPageTemplateV1>;

    /**
     * Update an existing page template. Rejects default and locked page templates.
     */
    updatePageTemplate(page: IPublisherPageTemplateV1): Promise<IPublisherPageTemplateV1>;

    /**
     * Delete an existing page template. Rejects default and locked page templates.
     */
    deletePageTemplate(ref: ObjRef): Promise<void>;

    //
    // Document templates
    //

    /**
     * Get the list of document templates available in the workspace.
     */
    getDocumentTemplates(): Promise<IPublisherDocumentTemplateV1[]>;

    /**
     * Get a single document template by its reference.
     */
    getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplateV1>;

    /**
     * Create a new document template.
     */
    createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinitionV1,
    ): Promise<IPublisherDocumentTemplateV1>;

    /**
     * Update an existing document template. Rejects locked templates.
     */
    updateDocumentTemplate(template: IPublisherDocumentTemplateV1): Promise<IPublisherDocumentTemplateV1>;

    /**
     * Delete an existing document template.
     */
    deleteDocumentTemplate(ref: ObjRef): Promise<void>;

    //
    // Documents
    //

    /**
     * Get the list of documents available in the workspace.
     */
    getDocuments(): Promise<IPublisherDocumentV1[]>;

    /**
     * Tells whether the workspace has any document, without loading them.
     */
    hasDocuments(): Promise<boolean>;

    /**
     * Get a single document by its reference.
     */
    getDocument(ref: ObjRef): Promise<IPublisherDocumentV1>;

    /**
     * Create a new document.
     */
    createDocument(publisherDocument: IPublisherDocumentDefinitionV1): Promise<IPublisherDocumentV1>;

    /**
     * Update an existing document. Rejects locked documents.
     */
    updateDocument(publisherDocument: IPublisherDocumentV1): Promise<IPublisherDocumentV1>;

    /**
     * Delete an existing document.
     */
    deleteDocument(ref: ObjRef): Promise<void>;

    /**
     * Export a document to PDF.
     *
     * @remarks
     * The backend renders the document as it is saved, so unsaved changes are not part of the export.
     */
    exportDocumentToPdf(ref: ObjRef, options?: IPublisherDocumentExportPdfOptions): Promise<IExportResult>;
}

/**
 * What the document list shows of a document whose content cannot be read. It carries no period and no
 * content.
 *
 * @alpha
 */
export interface IPublisherDocumentSummaryV2 extends IAuditableDates, IAuditableUsers {
    ref: ObjRef;
    title: string;
    description?: string;
    tags?: string[];
    version: string;
    isLocked?: boolean;
}

/**
 * One document of the document list: a readable document, or the summary of one that is not.
 *
 * @alpha
 */
export type PublisherDocumentListItemV2 =
    | { supported: true; document: IPublisherDocumentV2 }
    | { supported: false; summary: IPublisherDocumentSummaryV2; error: PublisherContentNotSupportedError };

/**
 * Service for managing Publisher page templates, document templates and documents in content version 2.
 *
 * @remarks
 * Every entity is validated on load and before save. Content that fails the validation, or has a
 * version this frontend does not read, throws {@link PublisherContentNotSupportedError}; a save that
 * fails it never reaches the backend.
 *
 * The page template and document template lists leave such entities out. The document list keeps them
 * as unsupported items.
 *
 * Default page templates come from the backend and carry `isDefault: true`. A save under a `default.` id
 * is rejected before the backend, and the backend rejects deleting a default page template. A copy saved
 * under a new id is an ordinary page template.
 *
 * @alpha
 */
export interface IWorkspacePublisherServiceV2 {
    getPageTemplates(): Promise<IPublisherPageTemplateV2[]>;

    getPageTemplate(ref: ObjRef): Promise<IPublisherPageTemplateV2>;

    createPageTemplate(template: IPublisherPageTemplateDefinitionV2): Promise<IPublisherPageTemplateV2>;

    updatePageTemplate(template: IPublisherPageTemplateV2): Promise<IPublisherPageTemplateV2>;

    deletePageTemplate(ref: ObjRef): Promise<void>;

    getDocumentTemplates(): Promise<IPublisherDocumentTemplateV2[]>;

    getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplateV2>;

    createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinitionV2,
    ): Promise<IPublisherDocumentTemplateV2>;

    updateDocumentTemplate(template: IPublisherDocumentTemplateV2): Promise<IPublisherDocumentTemplateV2>;

    deleteDocumentTemplate(ref: ObjRef): Promise<void>;

    getDocuments(): Promise<PublisherDocumentListItemV2[]>;

    getDocument(ref: ObjRef): Promise<IPublisherDocumentV2>;

    createDocument(publisherDocument: IPublisherDocumentDefinitionV2): Promise<IPublisherDocumentV2>;

    updateDocument(publisherDocument: IPublisherDocumentV2): Promise<IPublisherDocumentV2>;

    deleteDocument(ref: ObjRef): Promise<void>;

    /**
     * The backend renders the document as it is saved, so unsaved changes are not part of the export.
     */
    exportDocumentToPdf(ref: ObjRef, options?: IPublisherDocumentExportPdfOptions): Promise<IExportResult>;
}
