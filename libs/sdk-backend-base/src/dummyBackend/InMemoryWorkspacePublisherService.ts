// (C) 2026 GoodData Corporation

import {
    type IExportResult,
    type IPublisherDocumentExportPdfOptions,
    type IWorkspacePublisherService,
    NotSupported,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    BuiltInPublisherPageLayouts,
    type IPublisherDocument,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentTemplate,
    type IPublisherDocumentTemplateDefinition,
    type IPublisherPageLayout,
    type IPublisherPageLayoutDefinition,
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
 * Serves the built-in page layouts and stores created layouts, templates and documents in
 * memory for the lifetime of the instance (dummy backend, tests).
 *
 * @alpha
 */
export class InMemoryWorkspacePublisherService implements IWorkspacePublisherService {
    private readonly pageLayouts = new Map<string, IPublisherPageLayout>();
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

    private findBuiltInPageLayout(ref: ObjRef): IPublisherPageLayout | undefined {
        return BuiltInPublisherPageLayouts.find((layout) => areObjRefsEqual(layout.ref, ref));
    }

    public getPageLayouts(): Promise<IPublisherPageLayout[]> {
        return Promise.resolve([
            ...BuiltInPublisherPageLayouts,
            ...deepClone([...this.pageLayouts.values()]),
        ]);
    }

    public getPageLayout(ref: ObjRef): Promise<IPublisherPageLayout> {
        const builtIn = this.findBuiltInPageLayout(ref);
        if (builtIn) {
            return Promise.resolve(builtIn);
        }
        const layout = this.pageLayouts.get(refKey(ref));
        if (!layout) {
            throw new UnexpectedError(`Page layout "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(layout));
    }

    public createPageLayout(layout: IPublisherPageLayoutDefinition): Promise<IPublisherPageLayout> {
        if (layout.ref && this.findBuiltInPageLayout(layout.ref)) {
            throw new UnexpectedError(
                `Page layout "${objRefToString(layout.ref)}" is built-in and cannot be replaced.`,
            );
        }
        const created: IPublisherPageLayout = {
            ...deepClone(layout),
            ref: layout.ref ?? this.newRef("reportPageLayout", this.pageLayouts),
        };
        this.store(this.pageLayouts, created, "Page layout");
        return Promise.resolve(deepClone(created));
    }

    public updatePageLayout(layout: IPublisherPageLayout): Promise<IPublisherPageLayout> {
        this.assertPageLayoutEditable(layout.ref);
        const updated: IPublisherPageLayout = { ...deepClone(layout), isBuiltIn: undefined };
        this.pageLayouts.set(refKey(layout.ref), updated);
        return Promise.resolve(deepClone(updated));
    }

    public deletePageLayout(ref: ObjRef): Promise<void> {
        this.assertPageLayoutEditable(ref);
        this.pageLayouts.delete(refKey(ref));
        return Promise.resolve();
    }

    private assertPageLayoutEditable(ref: ObjRef): void {
        if (this.findBuiltInPageLayout(ref)) {
            throw new UnexpectedError(
                `Page layout "${objRefToString(ref)}" is built-in and cannot be changed.`,
            );
        }
        this.assertExistsAndUnlocked(this.pageLayouts, ref, "Page layout");
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
