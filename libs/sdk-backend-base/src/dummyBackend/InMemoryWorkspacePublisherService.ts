// (C) 2026 GoodData Corporation

import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherService,
    NotSupported,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    DefaultPublisherPageTemplates,
    type IPublisherDocument,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentTemplate,
    type IPublisherDocumentTemplateDefinition,
    type IPublisherPageTemplate,
    type IPublisherPageTemplateDefinition,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    isIdentifierRef,
    objRefToString,
} from "@gooddata/sdk-model";

// Key ignores the identifier ref's optional object type (typed and untyped identifier
// refs are equivalent under areObjRefsEqual) but keeps the ref kind, so an identifier
// and a URI with the same string stay distinct.
function refKey(ref: ObjRef): string {
    return isIdentifierRef(ref) ? `id:${ref.identifier}` : `uri:${ref.uri}`;
}

// JSON round-trip detaches stored state from caller-held objects on both the
// write and the read side, the way a real backend's serialization does.
function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

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
    private readonly pageTemplates = new Map<string, IPublisherPageTemplate>();
    private readonly templates = new Map<string, IPublisherDocumentTemplate>();
    private readonly documents = new Map<string, IPublisherDocument>();
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

    private findDefaultPageTemplate(ref: ObjRef): IPublisherPageTemplate | undefined {
        return DefaultPublisherPageTemplates.find((layout) => areObjRefsEqual(layout.ref, ref));
    }

    public getPageTemplates(): Promise<IPublisherPageTemplate[]> {
        return Promise.resolve([
            ...DefaultPublisherPageTemplates,
            ...deepClone([...this.pageTemplates.values()]),
        ]);
    }

    public getPageTemplate(ref: ObjRef): Promise<IPublisherPageTemplate> {
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

    public createPageTemplate(layout: IPublisherPageTemplateDefinition): Promise<IPublisherPageTemplate> {
        if (layout.ref && this.findDefaultPageTemplate(layout.ref)) {
            throw new UnexpectedError(
                `Default page template "${objRefToString(layout.ref)}" cannot be replaced.`,
            );
        }
        const created: IPublisherPageTemplate = {
            ...deepClone(layout),
            ref: layout.ref ?? this.newRef("reportPageLayout", this.pageTemplates),
        };
        this.store(this.pageTemplates, created, "Page template");
        return Promise.resolve(deepClone(created));
    }

    public updatePageTemplate(layout: IPublisherPageTemplate): Promise<IPublisherPageTemplate> {
        this.assertPageTemplateEditable(layout.ref);
        const updated: IPublisherPageTemplate = { ...deepClone(layout), isDefault: undefined };
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

    public getDocumentTemplates(): Promise<IPublisherDocumentTemplate[]> {
        return Promise.resolve(deepClone([...this.templates.values()]));
    }

    public getDocumentTemplate(ref: ObjRef): Promise<IPublisherDocumentTemplate> {
        const template = this.templates.get(refKey(ref));
        if (!template) {
            throw new UnexpectedError(`Document template "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(template));
    }

    public createDocumentTemplate(
        template: IPublisherDocumentTemplateDefinition,
    ): Promise<IPublisherDocumentTemplate> {
        const created: IPublisherDocumentTemplate = {
            ...deepClone(template),
            ref: template.ref ?? this.newRef("reportTemplate", this.templates),
        };
        this.store(this.templates, created, "Document template");
        return Promise.resolve(deepClone(created));
    }

    public updateDocumentTemplate(template: IPublisherDocumentTemplate): Promise<IPublisherDocumentTemplate> {
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

    public getDocuments(): Promise<IPublisherDocument[]> {
        return Promise.resolve(deepClone([...this.documents.values()]));
    }

    public getDocument(ref: ObjRef): Promise<IPublisherDocument> {
        const publisherDocument = this.documents.get(refKey(ref));
        if (!publisherDocument) {
            throw new UnexpectedError(`Document "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(publisherDocument));
    }

    public createDocument(publisherDocument: IPublisherDocumentDefinition): Promise<IPublisherDocument> {
        const created: IPublisherDocument = {
            ...deepClone(publisherDocument),
            ref: publisherDocument.ref ?? this.newRef("report", this.documents),
        };
        this.store(this.documents, created, "Document");
        return Promise.resolve(deepClone(created));
    }

    public updateDocument(publisherDocument: IPublisherDocument): Promise<IPublisherDocument> {
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
