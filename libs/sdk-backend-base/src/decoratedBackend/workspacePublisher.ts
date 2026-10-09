// (C) 2026 GoodData Corporation

import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherService,
} from "@gooddata/sdk-backend-spi";
import {
    type IPublisherDocument,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentTemplate,
    type IPublisherDocumentTemplateDefinition,
    type IPublisherPageLayout,
    type IPublisherPageLayoutDefinition,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * Base class for publisher-service decorators. Delegates every method of the decorated
 * `IWorkspacePublisherService`; subclasses override the methods they customize.
 *
 * @alpha
 */
export abstract class DecoratedWorkspacePublisherService implements IWorkspacePublisherService {
    protected constructor(protected readonly decorated: IWorkspacePublisherService) {}

    public getPageLayouts(): Promise<IPublisherPageLayout[]> {
        return this.decorated.getPageLayouts();
    }

    public getPageLayout(ref: ObjRef): Promise<IPublisherPageLayout> {
        return this.decorated.getPageLayout(ref);
    }

    public createPageLayout(page: IPublisherPageLayoutDefinition): Promise<IPublisherPageLayout> {
        return this.decorated.createPageLayout(page);
    }

    public updatePageLayout(page: IPublisherPageLayout): Promise<IPublisherPageLayout> {
        return this.decorated.updatePageLayout(page);
    }

    public deletePageLayout(ref: ObjRef): Promise<void> {
        return this.decorated.deletePageLayout(ref);
    }

    public getDocumentTemplates(): Promise<IPublisherDocumentTemplate[]> {
        return this.decorated.getDocumentTemplates();
    }

    public getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplate> {
        return this.decorated.getDocumentTemplate(ref);
    }

    public createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinition,
    ): Promise<IPublisherDocumentTemplate> {
        return this.decorated.createDocumentTemplate(template);
    }

    public updateDocumentTemplate(template: IPublisherDocumentTemplate): Promise<IPublisherDocumentTemplate> {
        return this.decorated.updateDocumentTemplate(template);
    }

    public deleteDocumentTemplate(ref: ObjRef): Promise<void> {
        return this.decorated.deleteDocumentTemplate(ref);
    }

    public getDocuments(): Promise<IPublisherDocument[]> {
        return this.decorated.getDocuments();
    }

    public getDocument(ref: ObjRef): Promise<IPublisherDocument> {
        return this.decorated.getDocument(ref);
    }

    public createDocument(publisherDocument: IPublisherDocumentDefinition): Promise<IPublisherDocument> {
        return this.decorated.createDocument(publisherDocument);
    }

    public updateDocument(publisherDocument: IPublisherDocument): Promise<IPublisherDocument> {
        return this.decorated.updateDocument(publisherDocument);
    }

    public deleteDocument(ref: ObjRef): Promise<void> {
        return this.decorated.deleteDocument(ref);
    }

    public exportDocumentToPdf(
        ref: ObjRef,
        options?: IPublisherDocumentExportPdfOptions,
    ): Promise<IExportResult> {
        return this.decorated.exportDocumentToPdf(ref, options);
    }
}
