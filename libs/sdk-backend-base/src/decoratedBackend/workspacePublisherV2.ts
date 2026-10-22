// (C) 2026 GoodData Corporation

import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherServiceV2,
    type PublisherDocumentListItemV2,
} from "@gooddata/sdk-backend-spi";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherDocumentTemplateV2,
    type IPublisherDocumentV2,
    type IPublisherPageTemplateDefinitionV2,
    type IPublisherPageTemplateV2,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * Base class for content version 2 publisher-service decorators. Delegates every method of the decorated
 * `IWorkspacePublisherServiceV2`; subclasses override the methods they customize.
 *
 * @alpha
 */
export abstract class DecoratedWorkspacePublisherServiceV2 implements IWorkspacePublisherServiceV2 {
    protected constructor(protected readonly decorated: IWorkspacePublisherServiceV2) {}

    public getPageTemplates(): Promise<IPublisherPageTemplateV2[]> {
        return this.decorated.getPageTemplates();
    }

    public getPageTemplate(ref: ObjRef): Promise<IPublisherPageTemplateV2> {
        return this.decorated.getPageTemplate(ref);
    }

    public createPageTemplate(
        template: IPublisherPageTemplateDefinitionV2,
    ): Promise<IPublisherPageTemplateV2> {
        return this.decorated.createPageTemplate(template);
    }

    public updatePageTemplate(template: IPublisherPageTemplateV2): Promise<IPublisherPageTemplateV2> {
        return this.decorated.updatePageTemplate(template);
    }

    public deletePageTemplate(ref: ObjRef): Promise<void> {
        return this.decorated.deletePageTemplate(ref);
    }

    public getDocumentTemplates(): Promise<IPublisherDocumentTemplateV2[]> {
        return this.decorated.getDocumentTemplates();
    }

    public getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplateV2> {
        return this.decorated.getDocumentTemplate(ref);
    }

    public createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinitionV2,
    ): Promise<IPublisherDocumentTemplateV2> {
        return this.decorated.createDocumentTemplate(template);
    }

    public updateDocumentTemplate(
        template: IPublisherDocumentTemplateV2,
    ): Promise<IPublisherDocumentTemplateV2> {
        return this.decorated.updateDocumentTemplate(template);
    }

    public deleteDocumentTemplate(ref: ObjRef): Promise<void> {
        return this.decorated.deleteDocumentTemplate(ref);
    }

    public getDocuments(): Promise<PublisherDocumentListItemV2[]> {
        return this.decorated.getDocuments();
    }

    public getDocument(ref: ObjRef): Promise<IPublisherDocumentV2> {
        return this.decorated.getDocument(ref);
    }

    public createDocument(publisherDocument: IPublisherDocumentDefinitionV2): Promise<IPublisherDocumentV2> {
        return this.decorated.createDocument(publisherDocument);
    }

    public updateDocument(publisherDocument: IPublisherDocumentV2): Promise<IPublisherDocumentV2> {
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
