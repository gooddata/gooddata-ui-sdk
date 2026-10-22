// (C) 2026 GoodData Corporation

import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherServiceV2,
    NotSupported,
    type PublisherDocumentListItemV2,
    assertPublisherEntitySupportedV2,
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

import { InMemoryPublisherStore } from "./inMemoryPublisherStore.js";

function withoutIsDefault<T extends IPublisherPageTemplateDefinitionV2>(
    template: T & { isDefault?: boolean },
): Omit<T, "isDefault"> {
    const { isDefault: _, ...rest } = template;
    return rest;
}

/**
 * In-memory implementation of the content version 2 publisher service.
 *
 * @remarks
 * Stores page templates, document templates and documents in memory for the lifetime of the instance
 * (dummy backend, tests). It serves no default page templates. Saves validate the content and reject
 * with {@link @gooddata/sdk-backend-spi#PublisherContentNotSupportedError}.
 *
 * @alpha
 */
export class InMemoryWorkspacePublisherServiceV2 implements IWorkspacePublisherServiceV2 {
    private readonly pageTemplates = new InMemoryPublisherStore<IPublisherPageTemplateV2>(
        "pageTemplate",
        "Page template",
    );
    private readonly documentTemplates = new InMemoryPublisherStore<IPublisherDocumentTemplateV2>(
        "documentTemplate",
        "Document template",
    );
    private readonly documents = new InMemoryPublisherStore<IPublisherDocumentV2>("document", "Document");

    public async getPageTemplates(): Promise<IPublisherPageTemplateV2[]> {
        return this.pageTemplates.list();
    }

    public async getPageTemplate(ref: ObjRef): Promise<IPublisherPageTemplateV2> {
        return this.pageTemplates.get(ref);
    }

    public async createPageTemplate(
        template: IPublisherPageTemplateDefinitionV2,
    ): Promise<IPublisherPageTemplateV2> {
        assertPublisherEntitySupportedV2(template);
        return this.pageTemplates.add({
            ...withoutIsDefault(template),
            ref: template.ref ?? this.pageTemplates.newRef(),
        });
    }

    public async updatePageTemplate(template: IPublisherPageTemplateV2): Promise<IPublisherPageTemplateV2> {
        assertPublisherEntitySupportedV2(template);
        return this.pageTemplates.replace(withoutIsDefault(template));
    }

    public async deletePageTemplate(ref: ObjRef): Promise<void> {
        this.pageTemplates.remove(ref);
    }

    public async getDocumentTemplates(): Promise<IPublisherDocumentTemplateV2[]> {
        return this.documentTemplates.list();
    }

    public async getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplateV2> {
        return this.documentTemplates.get(ref);
    }

    public async createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinitionV2,
    ): Promise<IPublisherDocumentTemplateV2> {
        assertPublisherEntitySupportedV2(template);
        return this.documentTemplates.add({
            ...template,
            ref: template.ref ?? this.documentTemplates.newRef(),
        });
    }

    public async updateDocumentTemplate(
        template: IPublisherDocumentTemplateV2,
    ): Promise<IPublisherDocumentTemplateV2> {
        assertPublisherEntitySupportedV2(template);
        return this.documentTemplates.replace(template);
    }

    public async deleteDocumentTemplate(ref: ObjRef): Promise<void> {
        this.documentTemplates.remove(ref);
    }

    public async getDocuments(): Promise<PublisherDocumentListItemV2[]> {
        return this.documents.list().map((document) => ({ supported: true, document }));
    }

    public async getDocument(ref: ObjRef): Promise<IPublisherDocumentV2> {
        return this.documents.get(ref);
    }

    public async createDocument(
        publisherDocument: IPublisherDocumentDefinitionV2,
    ): Promise<IPublisherDocumentV2> {
        assertPublisherEntitySupportedV2(publisherDocument);
        return this.documents.add({
            ...publisherDocument,
            ref: publisherDocument.ref ?? this.documents.newRef(),
        });
    }

    public async updateDocument(publisherDocument: IPublisherDocumentV2): Promise<IPublisherDocumentV2> {
        assertPublisherEntitySupportedV2(publisherDocument);
        return this.documents.replace(publisherDocument);
    }

    public async deleteDocument(ref: ObjRef): Promise<void> {
        this.documents.remove(ref);
    }

    public async exportDocumentToPdf(
        _ref: ObjRef,
        _options?: IPublisherDocumentExportPdfOptions,
    ): Promise<IExportResult> {
        throw new NotSupported("not supported");
    }
}
