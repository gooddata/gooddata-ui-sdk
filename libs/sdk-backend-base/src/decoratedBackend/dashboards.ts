// (C) 2021-2025 GoodData Corporation
import {
    IDashboardExportImageOptions,
    IDashboardExportTabularOptions,
    IDashboardReferences,
    IDashboardWithReferences,
    IDashboardsQuery,
    IExportResult,
    IGetDashboardOptions,
    IGetDashboardPluginOptions,
    IGetScheduledMailOptions,
    IRawExportCustomOverrides,
    IWidgetAlertCount,
    IWidgetReferences,
    IWorkspaceDashboardsService,
    SupportedDashboardReferenceTypes,
    SupportedWidgetReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import {
    FilterContextItem,
    IDashboard,
    IDashboardAttributeFilterConfig,
    IDashboardDefinition,
    IDashboardFilterView,
    IDashboardPermissions,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDateFilter,
    IExecutionDefinition,
    IExistingDashboard,
    IFilter,
    IFilterContext,
    IFilterContextDefinition,
    IListedDashboard,
    IScheduledMail,
    IScheduledMailDefinition,
    IWidget,
    IWidgetAlert,
    IWidgetAlertDefinition,
    ObjRef,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceDashboardsService implements IWorkspaceDashboardsService {
    protected constructor(
        protected decorated: IWorkspaceDashboardsService,
        public workspace: string,
    ) {}

    getDashboards(options?: IGetDashboardOptions): Promise<IListedDashboard[]> {
        return this.decorated.getDashboards(options);
    }

    getDashboardsQuery(): IDashboardsQuery {
        return this.decorated.getDashboardsQuery();
    }

    getDashboard(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
    ): Promise<IDashboard> {
        return this.decorated.getDashboard(ref, filterContextRef, options);
    }

    getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardWithReferences> {
        return this.decorated.getDashboardWithReferences(ref, filterContextRef, options, types);
    }

    public getFilterContextByExportId = async (
        exportId: string,
        type: "visual" | "slides" | undefined,
    ): Promise<{ filterContext?: IFilterContext; title?: string; hideWidgetTitles?: boolean } | null> => {
        return this.decorated.getFilterContextByExportId(exportId, type);
    };

    getDashboardReferencedObjects(
        dashboard: IDashboard,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardReferences> {
        return this.decorated.getDashboardReferencedObjects(dashboard, types);
    }

    createDashboard(dashboard: IDashboardDefinition): Promise<IDashboard> {
        return this.decorated.createDashboard(dashboard);
    }

    updateDashboard(dashboard: IDashboard, updatedDashboard: IDashboardDefinition): Promise<IDashboard> {
        return this.decorated.updateDashboard(dashboard, updatedDashboard);
    }

    deleteDashboard(ref: ObjRef): Promise<void> {
        return this.decorated.deleteDashboard(ref);
    }

    exportDashboardToPdf(ref: ObjRef, filters?: FilterContextItem[]): Promise<IExportResult> {
        return this.decorated.exportDashboardToPdf(ref, filters);
    }

    exportDashboardToPresentation(
        ref: ObjRef,
        format: "PPTX" | "PDF",
        filters?: FilterContextItem[],
        options?: {
            widgetIds?: ObjRef[];
            filename?: string;
        },
    ): Promise<IExportResult> {
        return this.decorated.exportDashboardToPresentation(ref, format, filters, options);
    }

    exportDashboardToImage(
        ref: ObjRef,
        filters?: FilterContextItem[],
        options?: IDashboardExportImageOptions,
    ): Promise<IExportResult> {
        return this.decorated.exportDashboardToImage(ref, filters, options);
    }

    exportDashboardToTabular(ref: ObjRef, options?: IDashboardExportTabularOptions): Promise<IExportResult> {
        return this.decorated.exportDashboardToTabular(ref, options);
    }

    exportDashboardToCSVRaw(
        definition: IExecutionDefinition,
        fileName: string,
        customOverrides?: IRawExportCustomOverrides,
    ): Promise<IExportResult> {
        return this.decorated.exportDashboardToCSVRaw(definition, fileName, customOverrides);
    }

    createScheduledMail(
        scheduledMail: IScheduledMailDefinition,
        exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail> {
        return this.decorated.createScheduledMail(scheduledMail, exportFilterContext);
    }

    updateScheduledMail(
        ref: ObjRef,
        scheduledMailDefinition: IScheduledMailDefinition,
        filterContextRef?: ObjRef,
    ): Promise<void> {
        return this.decorated.updateScheduledMail(ref, scheduledMailDefinition, filterContextRef);
    }

    deleteScheduledMail(ref: ObjRef): Promise<void> {
        return this.decorated.deleteScheduledMail(ref);
    }

    getScheduledMailsForDashboard(
        ref: ObjRef,
        options?: IGetScheduledMailOptions,
    ): Promise<IScheduledMail[]> {
        return this.decorated.getScheduledMailsForDashboard(ref, options);
    }

    getScheduledMailsCountForDashboard(ref: ObjRef): Promise<number> {
        return this.decorated.getScheduledMailsCountForDashboard(ref);
    }

    getAllWidgetAlertsForCurrentUser(): Promise<IWidgetAlert[]> {
        return this.decorated.getAllWidgetAlertsForCurrentUser();
    }

    getDashboardWidgetAlertsForCurrentUser(ref: ObjRef): Promise<IWidgetAlert[]> {
        return this.decorated.getDashboardWidgetAlertsForCurrentUser(ref);
    }

    getWidgetAlertsCountForWidgets(refs: ObjRef[]): Promise<IWidgetAlertCount[]> {
        return this.decorated.getWidgetAlertsCountForWidgets(refs);
    }

    createWidgetAlert(alert: IWidgetAlertDefinition): Promise<IWidgetAlert> {
        return this.decorated.createWidgetAlert(alert);
    }

    updateWidgetAlert(alert: IWidgetAlert | IWidgetAlertDefinition): Promise<IWidgetAlert> {
        return this.decorated.updateWidgetAlert(alert);
    }

    deleteWidgetAlert(ref: ObjRef): Promise<void> {
        return this.decorated.deleteWidgetAlert(ref);
    }

    deleteWidgetAlerts(refs: ObjRef[]): Promise<void> {
        return this.decorated.deleteWidgetAlerts(refs);
    }

    getWidgetReferencedObjects(
        widget: IWidget,
        types?: SupportedWidgetReferenceTypes[],
    ): Promise<IWidgetReferences> {
        return this.decorated.getWidgetReferencedObjects(widget, types);
    }

    getResolvedFiltersForWidget(
        widget: IWidget,
        filters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> {
        return this.decorated.getResolvedFiltersForWidget(widget, filters, attributeFilterConfigs);
    }

    getResolvedFiltersForWidgetWithMultipleDateFilters(
        widget: IWidget,
        commonDateFilters: IDateFilter[],
        otherFilters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> {
        return this.decorated.getResolvedFiltersForWidget(
            widget,
            [...commonDateFilters, ...otherFilters],
            attributeFilterConfigs,
        );
    }

    getDashboardPlugins(options?: IGetDashboardPluginOptions): Promise<IDashboardPlugin[]> {
        return this.decorated.getDashboardPlugins(options);
    }

    getDashboardPlugin(ref: ObjRef, options?: IGetDashboardPluginOptions): Promise<IDashboardPlugin> {
        return this.decorated.getDashboardPlugin(ref, options);
    }

    createDashboardPlugin(plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin> {
        return this.decorated.createDashboardPlugin(plugin);
    }

    deleteDashboardPlugin(ref: ObjRef): Promise<void> {
        return this.decorated.deleteDashboardPlugin(ref);
    }

    getDashboardPermissions(ref: ObjRef): Promise<IDashboardPermissions> {
        return this.decorated.getDashboardPermissions(ref);
    }

    validateDashboardsExistence(dashboardRefs: ObjRef[]): Promise<IExistingDashboard[]> {
        return this.decorated.validateDashboardsExistence(dashboardRefs);
    }

    getFilterViewsForCurrentUser(dashboardRef: ObjRef): Promise<IDashboardFilterView[]> {
        return this.decorated.getFilterViewsForCurrentUser(dashboardRef);
    }

    createFilterView(filterView: IDashboardFilterView): Promise<IDashboardFilterView> {
        return this.decorated.createFilterView(filterView);
    }

    deleteFilterView(ref: ObjRef): Promise<void> {
        return this.decorated.deleteFilterView(ref);
    }

    setFilterViewAsDefault(ref: ObjRef, isDefault: boolean): Promise<void> {
        return this.decorated.setFilterViewAsDefault(ref, isDefault);
    }
}
