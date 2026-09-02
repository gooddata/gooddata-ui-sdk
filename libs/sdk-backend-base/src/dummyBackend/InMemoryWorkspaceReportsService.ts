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
    type IReportsBrandKit,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    isIdentifierRef,
    objRefToString,
    sanitizeReportsBrandKit,
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
 * In-memory implementation of the reports service.
 *
 * @remarks
 * Serves the built-in report page layouts and stores created layouts, templates and reports in
 * memory for the lifetime of the instance (dummy backend, tests).
 *
 * @alpha
 */
export class InMemoryWorkspaceReportsService implements IWorkspaceReportsService {
    private readonly pageLayouts = new Map<string, IReportPageLayout>();
    private readonly templates = new Map<string, IReportTemplate>();
    private readonly reports = new Map<string, IReport>();
    private brandKit: IReportsBrandKit | undefined;
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

    private findBuiltInPageLayout(ref: ObjRef): IReportPageLayout | undefined {
        return BuiltInReportPageLayouts.find((layout) => areObjRefsEqual(layout.ref, ref));
    }

    public getReportPageLayouts(): Promise<IReportPageLayout[]> {
        return Promise.resolve([...BuiltInReportPageLayouts, ...deepClone([...this.pageLayouts.values()])]);
    }

    public getReportPageLayout(ref: ObjRef): Promise<IReportPageLayout> {
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
        return Promise.resolve(deepClone(created));
    }

    public updateReportPageLayout(layout: IReportPageLayout): Promise<IReportPageLayout> {
        this.assertPageLayoutEditable(layout.ref);
        const updated: IReportPageLayout = { ...deepClone(layout), isBuiltIn: undefined };
        this.pageLayouts.set(refKey(layout.ref), updated);
        return Promise.resolve(deepClone(updated));
    }

    public deleteReportPageLayout(ref: ObjRef): Promise<void> {
        this.assertPageLayoutEditable(ref);
        this.pageLayouts.delete(refKey(ref));
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
        return Promise.resolve(deepClone([...this.templates.values()]));
    }

    public getReportTemplate(ref: ObjRef): Promise<IReportTemplate> {
        const template = this.templates.get(refKey(ref));
        if (!template) {
            throw new UnexpectedError(`Report template "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(template));
    }

    public createReportTemplate(template: IReportTemplateDefinition): Promise<IReportTemplate> {
        const created: IReportTemplate = {
            ...deepClone(template),
            ref: template.ref ?? this.newRef("reportTemplate", this.templates),
        };
        this.store(this.templates, created, "Report template");
        return Promise.resolve(deepClone(created));
    }

    public updateReportTemplate(template: IReportTemplate): Promise<IReportTemplate> {
        this.assertExistsAndUnlocked(this.templates, template.ref, "Report template");
        const updated = deepClone(template);
        this.templates.set(refKey(template.ref), updated);
        return Promise.resolve(deepClone(updated));
    }

    public deleteReportTemplate(ref: ObjRef): Promise<void> {
        this.assertExistsAndUnlocked(this.templates, ref, "Report template");
        this.templates.delete(refKey(ref));
        return Promise.resolve();
    }

    public getReports(): Promise<IReport[]> {
        return Promise.resolve(deepClone([...this.reports.values()]));
    }

    public getReport(ref: ObjRef): Promise<IReport> {
        const report = this.reports.get(refKey(ref));
        if (!report) {
            throw new UnexpectedError(`Report "${objRefToString(ref)}" does not exist.`);
        }
        return Promise.resolve(deepClone(report));
    }

    public createReport(report: IReportDefinition): Promise<IReport> {
        const created: IReport = {
            ...deepClone(report),
            ref: report.ref ?? this.newRef("report", this.reports),
        };
        this.store(this.reports, created, "Report");
        return Promise.resolve(deepClone(created));
    }

    public updateReport(report: IReport): Promise<IReport> {
        this.assertExistsAndUnlocked(this.reports, report.ref, "Report");
        const updated = deepClone(report);
        this.reports.set(refKey(report.ref), updated);
        return Promise.resolve(deepClone(updated));
    }

    public deleteReport(ref: ObjRef): Promise<void> {
        this.assertExistsAndUnlocked(this.reports, ref, "Report");
        this.reports.delete(refKey(ref));
        return Promise.resolve();
    }

    public getBrandKit(): Promise<IReportsBrandKit | undefined> {
        return Promise.resolve(this.brandKit === undefined ? undefined : deepClone(this.brandKit));
    }

    public setBrandKit(brandKit: IReportsBrandKit): Promise<void> {
        const sanitized = sanitizeReportsBrandKit(brandKit);
        if (sanitized === undefined) {
            throw new UnexpectedError("The provided value is not a valid brand kit.");
        }
        this.brandKit = sanitized;
        return Promise.resolve();
    }

    public deleteBrandKit(): Promise<void> {
        this.brandKit = undefined;
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
