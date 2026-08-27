// (C) 2026 GoodData Corporation

import { type IWorkspaceReportsService } from "@gooddata/sdk-backend-spi";
import {
    type IReport,
    type IReportDefinition,
    type IReportPageLayout,
    type IReportPageLayoutDefinition,
    type IReportTemplate,
    type IReportTemplateDefinition,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * Base class for report-service decorators. Delegates every method of the decorated
 * `IWorkspaceReportsService`; subclasses override the methods they customize.
 *
 * @alpha
 */
export abstract class DecoratedWorkspaceReportsService implements IWorkspaceReportsService {
    protected constructor(protected readonly decorated: IWorkspaceReportsService) {}

    public getReportPageLayouts(): Promise<IReportPageLayout[]> {
        return this.decorated.getReportPageLayouts();
    }

    public getReportPageLayout(ref: ObjRef): Promise<IReportPageLayout> {
        return this.decorated.getReportPageLayout(ref);
    }

    public createReportPageLayout(page: IReportPageLayoutDefinition): Promise<IReportPageLayout> {
        return this.decorated.createReportPageLayout(page);
    }

    public updateReportPageLayout(page: IReportPageLayout): Promise<IReportPageLayout> {
        return this.decorated.updateReportPageLayout(page);
    }

    public deleteReportPageLayout(ref: ObjRef): Promise<void> {
        return this.decorated.deleteReportPageLayout(ref);
    }

    public getReportTemplates(): Promise<IReportTemplate[]> {
        return this.decorated.getReportTemplates();
    }

    public getReportTemplate(ref: ObjRef): Promise<IReportTemplate> {
        return this.decorated.getReportTemplate(ref);
    }

    public createReportTemplate(template: IReportTemplateDefinition): Promise<IReportTemplate> {
        return this.decorated.createReportTemplate(template);
    }

    public updateReportTemplate(template: IReportTemplate): Promise<IReportTemplate> {
        return this.decorated.updateReportTemplate(template);
    }

    public deleteReportTemplate(ref: ObjRef): Promise<void> {
        return this.decorated.deleteReportTemplate(ref);
    }

    public getReports(): Promise<IReport[]> {
        return this.decorated.getReports();
    }

    public getReport(ref: ObjRef): Promise<IReport> {
        return this.decorated.getReport(ref);
    }

    public createReport(report: IReportDefinition): Promise<IReport> {
        return this.decorated.createReport(report);
    }

    public updateReport(report: IReport): Promise<IReport> {
        return this.decorated.updateReport(report);
    }

    public deleteReport(ref: ObjRef): Promise<void> {
        return this.decorated.deleteReport(ref);
    }
}
