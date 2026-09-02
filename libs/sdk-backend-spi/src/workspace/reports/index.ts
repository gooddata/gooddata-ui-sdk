// (C) 2026 GoodData Corporation

import {
    type IReport,
    type IReportDefinition,
    type IReportPageLayout,
    type IReportPageLayoutDefinition,
    type IReportTemplate,
    type IReportTemplateDefinition,
    type IReportsBrandKit,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * Service for managing report page layouts, report templates and reports.
 *
 * @remarks
 * Report page layouts returned by this service include the built-in layouts shipped with the
 * product ({@link @gooddata/sdk-model#BuiltInReportPageLayouts}). Built-ins carry
 * `isBuiltIn: true`, are never persisted on the backend, and reject update and delete.
 *
 * @alpha
 */
export interface IWorkspaceReportsService {
    //
    // Report page layouts
    //

    /**
     * Get the list of report page layouts available in the workspace, built-in layouts first.
     */
    getReportPageLayouts(): Promise<IReportPageLayout[]>;

    /**
     * Get a single report page layout by its reference.
     */
    getReportPageLayout(ref: ObjRef): Promise<IReportPageLayout>;

    /**
     * Create a new report page layout.
     */
    createReportPageLayout(page: IReportPageLayoutDefinition): Promise<IReportPageLayout>;

    /**
     * Update an existing report page layout. Rejects built-in and locked layouts.
     */
    updateReportPageLayout(page: IReportPageLayout): Promise<IReportPageLayout>;

    /**
     * Delete an existing report page layout. Rejects built-in and locked layouts.
     */
    deleteReportPageLayout(ref: ObjRef): Promise<void>;

    //
    // Report templates
    //

    /**
     * Get the list of report templates available in the workspace.
     */
    getReportTemplates(): Promise<IReportTemplate[]>;

    /**
     * Get a single report template by its reference.
     */
    getReportTemplate(ref: ObjRef): Promise<IReportTemplate>;

    /**
     * Create a new report template.
     */
    createReportTemplate(template: IReportTemplateDefinition): Promise<IReportTemplate>;

    /**
     * Update an existing report template. Rejects locked templates.
     */
    updateReportTemplate(template: IReportTemplate): Promise<IReportTemplate>;

    /**
     * Delete an existing report template.
     */
    deleteReportTemplate(ref: ObjRef): Promise<void>;

    //
    // Reports
    //

    /**
     * Get the list of reports available in the workspace.
     */
    getReports(): Promise<IReport[]>;

    /**
     * Get a single report by its reference.
     */
    getReport(ref: ObjRef): Promise<IReport>;

    /**
     * Create a new report.
     */
    createReport(report: IReportDefinition): Promise<IReport>;

    /**
     * Update an existing report. Rejects locked reports.
     */
    updateReport(report: IReport): Promise<IReport>;

    /**
     * Delete an existing report.
     */
    deleteReport(ref: ObjRef): Promise<void>;

    //
    // Brand kit
    //

    /**
     * Get the workspace brand kit, or undefined when none is set.
     *
     * @remarks
     * Backed by the `reportsBrandKit` workspace setting. The stored content is free-form JSON;
     * implementations sanitize it ({@link @gooddata/sdk-model#sanitizeReportsBrandKit}) so the
     * result is always a valid kit.
     */
    getBrandKit(): Promise<IReportsBrandKit | undefined>;

    /**
     * Set the workspace brand kit.
     */
    setBrandKit(brandKit: IReportsBrandKit): Promise<void>;

    /**
     * Delete the workspace brand kit.
     */
    deleteBrandKit(): Promise<void>;
}
