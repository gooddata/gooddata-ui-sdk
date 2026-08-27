// (C) 2026 GoodData Corporation

import { type IWorkspaceReportsService, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    BuiltInReportPageLayouts,
    type IReport,
    type IReportDefinition,
    type IReportPageLayout,
    type IReportPageLayoutDefinition,
    type IReportTemplate,
    type IReportTemplateDefinition,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    isIdentifierRef,
    isObjRef,
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

function decode<T extends { ref: ObjRef }>(value: T[] | undefined): Map<string, T> {
    const decoded = new Map<string, T>();
    if (!Array.isArray(value)) {
        return decoded;
    }
    value.forEach((entry) => {
        if (!isObjRef(entry?.ref)) {
            throw new Error("Persisted report entry has no object reference.");
        }
        decoded.set(refKey(entry.ref), entry);
    });
    return decoded;
}

function replace<T>(target: Map<string, T>, source: Map<string, T>): void {
    target.clear();
    source.forEach((value, key) => target.set(key, value));
}

/**
 * Storage hook for {@link InMemoryWorkspaceReportsService}: where the serialized service
 * state is loaded from on construction and saved to after every mutation.
 *
 * @alpha
 */
export interface IWorkspaceReportsPersistence {
    load(): string | null;
    save(value: string): void;
}

interface IPersistedReportsState {
    pageLayouts: IReportPageLayout[];
    templates: IReportTemplate[];
    reports: IReport[];
    sequence: number;
}

/**
 * In-memory implementation of the reports service.
 *
 * @remarks
 * Serves the built-in report page layouts and stores created layouts, templates and reports in memory.
 * Without a persistence hook the state lives only as long as the instance (dummy backend, tests);
 * with one (e.g. localStorage) the state is rehydrated on construction and saved after every mutation.
 *
 * @alpha
 */
export class InMemoryWorkspaceReportsService implements IWorkspaceReportsService {
    private readonly pageLayouts = new Map<string, IReportPageLayout>();
    private readonly templates = new Map<string, IReportTemplate>();
    private readonly reports = new Map<string, IReport>();
    private sequence = 0;
    // Set when the storage rejected a write. Read-through would then restore the older
    // persisted snapshot and silently discard the mutation, so the in-memory state
    // becomes authoritative from that point on.
    private persistenceDisabled = false;

    constructor(private readonly persistence?: IWorkspaceReportsPersistence) {
        this.hydrate();
    }

    // Persisted storage is read through on every operation, so no instance can act on a
    // stale snapshot and overwrite state written by another instance, tab or process.
    // Storage failures (sandboxed embeds, exhausted quota, corrupted value) degrade to
    // the in-memory state rather than propagating to the caller.
    private hydrate(): void {
        if (!this.persistence || this.persistenceDisabled) {
            return;
        }
        try {
            const serialized = this.persistence.load();
            if (!serialized) {
                return;
            }
            const state = JSON.parse(serialized) as IPersistedReportsState;
            // Decode into fresh maps first: a malformed entry must not leave the service
            // with half-cleared state, so the swap happens only once everything decoded.
            const pageLayouts = decode(state?.pageLayouts);
            const templates = decode(state?.templates);
            const reports = decode(state?.reports);

            replace(this.pageLayouts, pageLayouts);
            replace(this.templates, templates);
            replace(this.reports, reports);
            this.sequence = Math.max(this.sequence, typeof state?.sequence === "number" ? state.sequence : 0);
        } catch {
            // unreadable, malformed or schema-incompatible state — keep the in-memory state
        }
    }

    private persist(): void {
        if (!this.persistence || this.persistenceDisabled) {
            return;
        }
        const state: IPersistedReportsState = {
            pageLayouts: [...this.pageLayouts.values()],
            templates: [...this.templates.values()],
            reports: [...this.reports.values()],
            sequence: this.sequence,
        };
        try {
            this.persistence.save(JSON.stringify(state));
        } catch {
            this.persistenceDisabled = true;
        }
    }

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

    private findBuiltInPageLayout(ref: ObjRef): IReportPageLayout | undefined {
        return BuiltInReportPageLayouts.find((layout) => areObjRefsEqual(layout.ref, ref));
    }

    public getReportPageLayouts(): Promise<IReportPageLayout[]> {
        this.hydrate();
        return Promise.resolve([...BuiltInReportPageLayouts, ...deepClone([...this.pageLayouts.values()])]);
    }

    public getReportPageLayout(ref: ObjRef): Promise<IReportPageLayout> {
        this.hydrate();
        const builtIn = this.findBuiltInPageLayout(ref);
        if (builtIn) {
            return Promise.resolve(builtIn);
        }
        const layout = this.pageLayouts.get(refKey(ref));
        if (!layout) {
            throw new UnexpectedError(`Report page layout "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(layout));
    }

    public createReportPageLayout(layout: IReportPageLayoutDefinition): Promise<IReportPageLayout> {
        this.hydrate();
        if (layout.ref && this.findBuiltInPageLayout(layout.ref)) {
            throw new UnexpectedError(
                `Report page layout "${objRefToString(layout.ref)}" is built-in and cannot be replaced.`,
            );
        }
        const created: IReportPageLayout = {
            ...deepClone(layout),
            ref: layout.ref ?? this.newRef("reportPageLayout", this.pageLayouts),
        };
        this.store(this.pageLayouts, created, "Report page layout");
        this.persist();
        return Promise.resolve(deepClone(created));
    }

    public updateReportPageLayout(layout: IReportPageLayout): Promise<IReportPageLayout> {
        this.hydrate();
        this.assertPageLayoutEditable(layout.ref);
        const updated: IReportPageLayout = { ...deepClone(layout), isBuiltIn: undefined };
        this.pageLayouts.set(refKey(layout.ref), updated);
        this.persist();
        return Promise.resolve(deepClone(updated));
    }

    public deleteReportPageLayout(ref: ObjRef): Promise<void> {
        this.hydrate();
        this.assertPageLayoutEditable(ref);
        this.pageLayouts.delete(refKey(ref));
        this.persist();
        return Promise.resolve();
    }

    private assertPageLayoutEditable(ref: ObjRef): void {
        if (this.findBuiltInPageLayout(ref)) {
            throw new UnexpectedError(
                `Report page layout "${objRefToString(ref)}" is built-in and cannot be changed.`,
            );
        }
        this.assertExistsAndUnlocked(this.pageLayouts, ref, "Report page layout");
    }

    public getReportTemplates(): Promise<IReportTemplate[]> {
        this.hydrate();
        return Promise.resolve(deepClone([...this.templates.values()]));
    }

    public getReportTemplate(ref: ObjRef): Promise<IReportTemplate> {
        this.hydrate();
        const template = this.templates.get(refKey(ref));
        if (!template) {
            throw new UnexpectedError(`Report template "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(template));
    }

    public createReportTemplate(template: IReportTemplateDefinition): Promise<IReportTemplate> {
        this.hydrate();
        const created: IReportTemplate = {
            ...deepClone(template),
            ref: template.ref ?? this.newRef("reportTemplate", this.templates),
        };
        this.store(this.templates, created, "Report template");
        this.persist();
        return Promise.resolve(deepClone(created));
    }

    public updateReportTemplate(template: IReportTemplate): Promise<IReportTemplate> {
        this.hydrate();
        this.assertExistsAndUnlocked(this.templates, template.ref, "Report template");
        const updated = deepClone(template);
        this.templates.set(refKey(template.ref), updated);
        this.persist();
        return Promise.resolve(deepClone(updated));
    }

    public deleteReportTemplate(ref: ObjRef): Promise<void> {
        this.hydrate();
        this.assertExistsAndUnlocked(this.templates, ref, "Report template");
        this.templates.delete(refKey(ref));
        this.persist();
        return Promise.resolve();
    }

    public getReports(): Promise<IReport[]> {
        this.hydrate();
        return Promise.resolve(deepClone([...this.reports.values()]));
    }

    public getReport(ref: ObjRef): Promise<IReport> {
        this.hydrate();
        const report = this.reports.get(refKey(ref));
        if (!report) {
            throw new UnexpectedError(`Report "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(report));
    }

    public createReport(report: IReportDefinition): Promise<IReport> {
        this.hydrate();
        const created: IReport = {
            ...deepClone(report),
            ref: report.ref ?? this.newRef("report", this.reports),
        };
        this.store(this.reports, created, "Report");
        this.persist();
        return Promise.resolve(deepClone(created));
    }

    public updateReport(report: IReport): Promise<IReport> {
        this.hydrate();
        this.assertExistsAndUnlocked(this.reports, report.ref, "Report");
        const updated = deepClone(report);
        this.reports.set(refKey(report.ref), updated);
        this.persist();
        return Promise.resolve(deepClone(updated));
    }

    public deleteReport(ref: ObjRef): Promise<void> {
        this.hydrate();
        this.assertExistsAndUnlocked(this.reports, ref, "Report");
        this.reports.delete(refKey(ref));
        this.persist();
        return Promise.resolve();
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
