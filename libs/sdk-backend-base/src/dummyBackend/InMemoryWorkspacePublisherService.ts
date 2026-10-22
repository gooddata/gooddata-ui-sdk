// (C) 2026 GoodData Corporation

import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherService,
    NotSupported,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    DefaultPublisherPageTemplatesV1,
    type IPublisherDocumentDefinitionV1,
    type IPublisherDocumentTemplateDefinitionV1,
    type IPublisherDocumentTemplateV1,
    type IPublisherDocumentV1,
    type IPublisherPageTemplateDefinitionV1,
    type IPublisherPageTemplateV1,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { deepClone, refKey } from "./inMemoryPublisherStore.js";

/**
 * In-memory implementation of the publisher service.
 *
 * @remarks
 * Serves the default page templates and stores created page templates, document templates and documents in
 * memory for the lifetime of the instance (dummy backend, tests).
 *
 * @alpha
 */
export class InMemoryWorkspacePublisherService implements IWorkspacePublisherService {
    private readonly pageTemplates = new Map<string, IPublisherPageTemplateV1>();
    private readonly templates = new Map<string, IPublisherDocumentTemplateV1>();
    private readonly documents = new Map<string, IPublisherDocumentV1>();
    private sequence = 0;

    private newRef(
        type: "reportPageLayout" | "reportTemplate" | "report",
        store: Map<string, unknown>,
    ): ObjRef {
        let ref: ObjRef;
        do {
            this.sequence += 1;
            ref = idRef(`${type}_${this.sequence}`, type);
        } while (store.has(refKey(ref)));
        return ref;
    }

    private findDefaultPageTemplate(ref: ObjRef): IPublisherPageTemplateV1 | undefined {
        return DefaultPublisherPageTemplatesV1.find((layout) => areObjRefsEqual(layout.ref, ref));
    }

    public getPageTemplates(): Promise<IPublisherPageTemplateV1[]> {
        return Promise.resolve([
            ...DefaultPublisherPageTemplatesV1,
            ...deepClone([...this.pageTemplates.values()]),
        ]);
    }

    public getPageTemplate(ref: ObjRef): Promise<IPublisherPageTemplateV1> {
        const defaultTemplate = this.findDefaultPageTemplate(ref);
        if (defaultTemplate) {
            return Promise.resolve(defaultTemplate);
        }
        const layout = this.pageTemplates.get(refKey(ref));
        if (!layout) {
            throw new UnexpectedError(`Page template "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(layout));
    }

    public createPageTemplate(layout: IPublisherPageTemplateDefinitionV1): Promise<IPublisherPageTemplateV1> {
        if (layout.ref && this.findDefaultPageTemplate(layout.ref)) {
            throw new UnexpectedError(
                `Default page template "${objRefToString(layout.ref)}" cannot be replaced.`,
            );
        }
        const created: IPublisherPageTemplateV1 = {
            ...deepClone(layout),
            ref: layout.ref ?? this.newRef("reportPageLayout", this.pageTemplates),
        };
        this.store(this.pageTemplates, created, "Page template");
        return Promise.resolve(deepClone(created));
    }

    public updatePageTemplate(layout: IPublisherPageTemplateV1): Promise<IPublisherPageTemplateV1> {
        this.assertPageTemplateEditable(layout.ref);
        const updated: IPublisherPageTemplateV1 = { ...deepClone(layout), isDefault: undefined };
        this.pageTemplates.set(refKey(layout.ref), updated);
        return Promise.resolve(deepClone(updated));
    }

    public deletePageTemplate(ref: ObjRef): Promise<void> {
        this.assertPageTemplateEditable(ref);
        this.pageTemplates.delete(refKey(ref));
        return Promise.resolve();
    }

    private assertPageTemplateEditable(ref: ObjRef): void {
        if (this.findDefaultPageTemplate(ref)) {
            throw new UnexpectedError(`Default page template "${objRefToString(ref)}" cannot be changed.`);
        }
        this.assertExistsAndUnlocked(this.pageTemplates, ref, "Page template");
    }

    public getDocumentTemplates(): Promise<IPublisherDocumentTemplateV1[]> {
        return Promise.resolve(deepClone([...this.templates.values()]));
    }

    public getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplateV1> {
        const template = this.templates.get(refKey(ref));
        if (!template) {
            throw new UnexpectedError(`Document template "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(template));
    }

    public createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinitionV1,
    ): Promise<IPublisherDocumentTemplateV1> {
        const created: IPublisherDocumentTemplateV1 = {
            ...deepClone(template),
            ref: template.ref ?? this.newRef("reportTemplate", this.templates),
        };
        this.store(this.templates, created, "Document template");
        return Promise.resolve(deepClone(created));
    }

    public updateDocumentTemplate(
        template: IPublisherDocumentTemplateV1,
    ): Promise<IPublisherDocumentTemplateV1> {
        this.assertExistsAndUnlocked(this.templates, template.ref, "Document template");
        const updated = deepClone(template);
        this.templates.set(refKey(template.ref), updated);
        return Promise.resolve(deepClone(updated));
    }

    public deleteDocumentTemplate(ref: ObjRef): Promise<void> {
        this.assertExistsAndUnlocked(this.templates, ref, "Document template");
        this.templates.delete(refKey(ref));
        return Promise.resolve();
    }

    public getDocuments(): Promise<IPublisherDocumentV1[]> {
        return Promise.resolve(deepClone([...this.documents.values()]));
    }

    public hasDocuments(): Promise<boolean> {
        return Promise.resolve(this.documents.size > 0);
    }

    public getDocument(ref: ObjRef): Promise<IPublisherDocumentV1> {
        const publisherDocument = this.documents.get(refKey(ref));
        if (!publisherDocument) {
            throw new UnexpectedError(`Document "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(publisherDocument));
    }

    public createDocument(publisherDocument: IPublisherDocumentDefinitionV1): Promise<IPublisherDocumentV1> {
        const created: IPublisherDocumentV1 = {
            ...deepClone(publisherDocument),
            ref: publisherDocument.ref ?? this.newRef("report", this.documents),
        };
        this.store(this.documents, created, "Document");
        return Promise.resolve(deepClone(created));
    }

    public updateDocument(publisherDocument: IPublisherDocumentV1): Promise<IPublisherDocumentV1> {
        this.assertExistsAndUnlocked(this.documents, publisherDocument.ref, "Document");
        const updated = deepClone(publisherDocument);
        this.documents.set(refKey(publisherDocument.ref), updated);
        return Promise.resolve(deepClone(updated));
    }

    public deleteDocument(ref: ObjRef): Promise<void> {
        this.assertExistsAndUnlocked(this.documents, ref, "Document");
        this.documents.delete(refKey(ref));
        return Promise.resolve();
    }

    public exportDocumentToPdf(
        _ref: ObjRef,
        _options?: IPublisherDocumentExportPdfOptions,
    ): Promise<IExportResult> {
        throw new NotSupported("not supported");
    }

    private store<T extends { ref: ObjRef }>(store: Map<string, T>, object: T, what: string): void {
        const key = refKey(object.ref);
        if (store.has(key)) {
            throw new UnexpectedError(`${what} "${objRefToString(object.ref)}" already exists.`);
        }
        store.set(key, object);
    }

    private assertExistsAndUnlocked(
        store: Map<string, { isLocked?: boolean }>,
        ref: ObjRef,
        what: string,
    ): void {
        const existing = store.get(refKey(ref));
        if (!existing) {
            throw new UnexpectedError(`${what} "${objRefToString(ref)}" does not exist.`);
        }
        if (existing.isLocked) {
            throw new UnexpectedError(`${what} "${objRefToString(ref)}" is locked.`);
        }
    }
}
