// (C) 2026 GoodData Corporation

import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherService,
} from "@gooddata/sdk-backend-spi";
import {
    type IPublisherDocumentDefinitionV1,
    type IPublisherDocumentTemplateDefinitionV1,
    type IPublisherDocumentTemplateV1,
    type IPublisherDocumentV1,
    type IPublisherPageTemplateDefinitionV1,
    type IPublisherPageTemplateV1,
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

    public getPageTemplates(): Promise<IPublisherPageTemplateV1[]> {
        return this.decorated.getPageTemplates();
    }

    public getPageTemplate(ref: ObjRef): Promise<IPublisherPageTemplateV1> {
        return this.decorated.getPageTemplate(ref);
    }

    public createPageTemplate(page: IPublisherPageTemplateDefinitionV1): Promise<IPublisherPageTemplateV1> {
        return this.decorated.createPageTemplate(page);
    }

    public updatePageTemplate(page: IPublisherPageTemplateV1): Promise<IPublisherPageTemplateV1> {
        return this.decorated.updatePageTemplate(page);
    }

    public deletePageTemplate(ref: ObjRef): Promise<void> {
        return this.decorated.deletePageTemplate(ref);
    }

    public getDocumentTemplates(): Promise<IPublisherDocumentTemplateV1[]> {
        return this.decorated.getDocumentTemplates();
    }

    public getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplateV1> {
        return this.decorated.getDocumentTemplate(ref);
    }

    public createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinitionV1,
    ): Promise<IPublisherDocumentTemplateV1> {
        return this.decorated.createDocumentTemplate(template);
    }

    public updateDocumentTemplate(
        template: IPublisherDocumentTemplateV1,
    ): Promise<IPublisherDocumentTemplateV1> {
        return this.decorated.updateDocumentTemplate(template);
    }

    public deleteDocumentTemplate(ref: ObjRef): Promise<void> {
        return this.decorated.deleteDocumentTemplate(ref);
    }

    public getDocuments(): Promise<IPublisherDocumentV1[]> {
        return this.decorated.getDocuments();
    }

    public hasDocuments(): Promise<boolean> {
        return this.decorated.hasDocuments();
    }

    public getDocument(ref: ObjRef): Promise<IPublisherDocumentV1> {
        return this.decorated.getDocument(ref);
    }

    public createDocument(publisherDocument: IPublisherDocumentDefinitionV1): Promise<IPublisherDocumentV1> {
        return this.decorated.createDocument(publisherDocument);
    }

    public updateDocument(publisherDocument: IPublisherDocumentV1): Promise<IPublisherDocumentV1> {
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
