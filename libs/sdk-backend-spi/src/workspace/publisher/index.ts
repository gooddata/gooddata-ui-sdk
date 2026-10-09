// (C) 2026 GoodData Corporation

import {
    type IPublisherDocument,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentTemplate,
    type IPublisherDocumentTemplateDefinition,
    type IPublisherPageLayout,
    type IPublisherPageLayoutDefinition,
    type ObjRef,
} from "@gooddata/sdk-model";

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
 * Service for managing page layouts, document templates and documents.
 *
 * @remarks
 * Page layouts returned by this service include the built-in layouts shipped with the
 * product ({@link @gooddata/sdk-model#BuiltInPublisherPageLayouts}). Built-ins carry
 * `isBuiltIn: true`, are never persisted on the backend, and reject update and delete.
 *
 * @alpha
 */
export interface IWorkspacePublisherService {
    //
    // Page layouts
    //

    /**
     * Get the list of page layouts available in the workspace, built-in layouts first.
     */
    getPageLayouts(): Promise<IPublisherPageLayout[]>;

    /**
     * Get a single page layout by its reference.
     */
    getPageLayout(ref: ObjRef): Promise<IPublisherPageLayout>;

    /**
     * Create a new page layout.
     */
    createPageLayout(page: IPublisherPageLayoutDefinition): Promise<IPublisherPageLayout>;

    /**
     * Update an existing page layout. Rejects built-in and locked layouts.
     */
    updatePageLayout(page: IPublisherPageLayout): Promise<IPublisherPageLayout>;

    /**
     * Delete an existing page layout. Rejects built-in and locked layouts.
     */
    deletePageLayout(ref: ObjRef): Promise<void>;

    //
    // Document templates
    //

    /**
     * Get the list of document templates available in the workspace.
     */
    getDocumentTemplates(): Promise<IPublisherDocumentTemplate[]>;

    /**
     * Get a single document template by its reference.
     */
    getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplate>;

    /**
     * Create a new document template.
     */
    createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinition,
    ): Promise<IPublisherDocumentTemplate>;

    /**
     * Update an existing document template. Rejects locked templates.
     */
    updateDocumentTemplate(template: IPublisherDocumentTemplate): Promise<IPublisherDocumentTemplate>;

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
    getDocuments(): Promise<IPublisherDocument[]>;

    /**
     * Get a single document by its reference.
     */
    getDocument(ref: ObjRef): Promise<IPublisherDocument>;

    /**
     * Create a new document.
     */
    createDocument(publisherDocument: IPublisherDocumentDefinition): Promise<IPublisherDocument>;

    /**
     * Update an existing document. Rejects locked documents.
     */
    updateDocument(publisherDocument: IPublisherDocument): Promise<IPublisherDocument>;

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
