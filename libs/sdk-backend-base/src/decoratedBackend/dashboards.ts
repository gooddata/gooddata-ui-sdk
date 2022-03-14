// (C) 2021-2022 GoodData Corporation
import {
    IWorkspaceDashboardsService,
    IGetDashboardOptions,
    IGetScheduledMailOptions,
    IListedDashboard,
    IDashboard,
    SupportedDashboardReferenceTypes,
    IDashboardWithReferences,
    IDashboardReferences,
    IDashboardDefinition,
    FilterContextItem,
    IScheduledMail,
    IScheduledMailDefinition,
    IFilterContextDefinition,
    IWidgetAlert,
    IWidgetAlertCount,
    IWidgetAlertDefinition,
    IWidget,
    SupportedWidgetReferenceTypes,
    IWidgetReferences,
    IDashboardPlugin,
    IDashboardPluginDefinition,
} from "@gooddata/sdk-backend-spi";
import { IFilter, ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceDashboardsService implements IWorkspaceDashboardsService {
    protected constructor(protected decorated: IWorkspaceDashboardsService, public workspace: string) {}

    getDashboards(options?: IGetDashboardOptions): Promise<IListedDashboard[]> {
        return this.decorated.getDashboards(options);
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

    exportDashboardToPdf(ref: ObjRef, filters?: FilterContextItem[]): Promise<string> {
        return this.decorated.exportDashboardToPdf(ref, filters);
    }

    createScheduledMail(
        scheduledMail: IScheduledMailDefinition,
        exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail> {
        return this.decorated.createScheduledMail(scheduledMail, exportFilterContext);
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

    getResolvedFiltersForWidget(widget: IWidget, filters: IFilter[]): Promise<IFilter[]> {
        return this.decorated.getResolvedFiltersForWidget(widget, filters);
    }

    getDashboardPlugins(): Promise<IDashboardPlugin[]> {
        return this.decorated.getDashboardPlugins();
    }

    getDashboardPlugin(ref: ObjRef): Promise<IDashboardPlugin> {
        return this.decorated.getDashboardPlugin(ref);
    }

    createDashboardPlugin(plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin> {
        return this.decorated.createDashboardPlugin(plugin);
    }

    deleteDashboardPlugin(ref: ObjRef): Promise<void> {
        return this.decorated.deleteDashboardPlugin(ref);
    }
}
