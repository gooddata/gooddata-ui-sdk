// (C) 2019-2021 GoodData Corporation
import { IFilter, ObjRef } from "@gooddata/sdk-model";
import { IListedDashboard, IDashboard, IDashboardDefinition, IDashboardWithReferences } from "./dashboard";
import { IWidgetAlert, IWidgetAlertDefinition, IWidgetAlertCount } from "./alert";
import { IScheduledMail, IScheduledMailDefinition } from "./scheduledMail";
import { IFilterContextDefinition, FilterContextItem } from "./filterContext";
import { IWidget, SupportedWidgetReferenceTypes, IWidgetReferences } from "./widget";

/**
 * Configuration options for getting dashboards.
 *
 * @alpha
 */
export interface IGetDashboardOptions {
    /**
     * Optionally specify if information about the users that created/modified the dashboard should be loaded.
     * Defaults to false.
     */
    loadUserData?: boolean;
}

/**
 * Service to list, create and update analytical dashboards
 *
 * @alpha
 */
export interface IWorkspaceDashboardsService {
    readonly workspace: string;

    /**
     * Queries workspace dashboards
     *
     * @param options - optionally specify additional options
     * @returns promise of list of the dashboards
     */
    getDashboards(options?: IGetDashboardOptions): Promise<IListedDashboard[]>;

    /**
     * Load dashboard by it's reference,
     * and optionally override filter context with the custom filter context
     * (custom filter context is used mainly for exporting)
     *
     * @param ref - dashboard ref
     * @param filterContextRef - Override dashboard filter context with the custom filter context
     * (This allows to modify filter context when exporting the dashboard)
     * @param options - optionally specify additional options
     * @returns promise of the dashboard
     */
    getDashboard(ref: ObjRef, filterContextRef?: ObjRef, options?: IGetDashboardOptions): Promise<IDashboard>;

    /**
     * Like getDashboard with loading reference objects
     *
     * @param ref - dashboard ref
     * @param filterContextRef - Override dashboard filter context with the custom filter context
     * (This allows to modify filter context when exporting the dashboard)
     * @param options - optionally specify additional options
     * @returns promise of the dashboard and references
     */
    getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
    ): Promise<IDashboardWithReferences>;

    /**
     * Create and save dashboard for the provided dashboard definition
     *
     * @param dashboard - dashboard definition
     * @returns promise of the created dashboard
     */
    createDashboard(dashboard: IDashboardDefinition): Promise<IDashboard>;

    /**
     * Update dashboard
     *
     * @param dashboard - original dashboard before modifications
     * @param updatedDashboard - modified dashboard
     * @returns promise of the updated dashboard
     */
    updateDashboard(dashboard: IDashboard, updatedDashboard: IDashboardDefinition): Promise<IDashboard>;

    /**
     * Delete dashboard
     *
     * @param ref - dashboard reference
     * @returns promise
     */
    deleteDashboard(ref: ObjRef): Promise<void>;

    /**
     * Export dashboard to pdf. You can optionally override dashboard filters with custom filters.
     * When no custom filters are set, the persisted dashboard filters will be used.
     *
     * @param ref - dashboard reference
     * @param filters - optionally override stored dashboard filters with custom filters
     * @returns promise with link to download the exported dashboard
     */
    exportDashboardToPdf(ref: ObjRef, filters?: FilterContextItem[]): Promise<string>;

    /**
     * Create scheduled mail for the dashboard
     *
     * @param scheduledMail - scheduled email definition
     * @param exportFilterContext - override dashboard filter context with the custom filter context during the export
     * @returns promise of the created scheduled email
     */
    createScheduledMail(
        scheduledMail: IScheduledMailDefinition,
        exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail>;

    /**
     * Get the number of scheduled emails for particular dashboard
     *
     * @param ref - dashboard reference
     * @returns promise with the number of scheduled emails connected to the dashboard
     */
    getScheduledMailsCountForDashboard(ref: ObjRef): Promise<number>;

    /**
     * Get all widget alerts for the current user
     *
     * @returns promise with all user widget alerts
     */
    getAllWidgetAlertsForCurrentUser(): Promise<IWidgetAlert[]>;

    /**
     * Get all widget alerts for the current user for the given dashboard
     *
     * @param ref - dashboard reference
     * @returns promise with all user widget alerts for the dashboard
     */
    getDashboardWidgetAlertsForCurrentUser(ref: ObjRef): Promise<IWidgetAlert[]>;

    /**
     * Get the number of widget alerts (created by any user) for particular widgets
     *
     * @param refs - widget references
     * @returns promise with array of pairs of widget ref and alert count
     */
    getWidgetAlertsCountForWidgets(refs: ObjRef[]): Promise<IWidgetAlertCount[]>;

    /**
     * Create widget alert for the provided widget alert definition
     *
     * @param alert - widget alert definition
     * @returns promise with the created alert
     */
    createWidgetAlert(alert: IWidgetAlertDefinition): Promise<IWidgetAlert>;

    /**
     * Update widget alert
     *
     * @param alert - updated widget alert
     * @returns promise with the updated alert
     */
    updateWidgetAlert(alert: IWidgetAlert | IWidgetAlertDefinition): Promise<IWidgetAlert>;

    /**
     * Delete widget alert with the given reference
     *
     * @param ref - widget alert reference
     * @returns promise
     */
    deleteWidgetAlert(ref: ObjRef): Promise<void>;

    /**
     * Widget alerts bulk delete
     *
     * @param refs - widget alerts references
     * @returns promise
     */
    deleteWidgetAlerts(refs: ObjRef[]): Promise<void>;

    /**
     * Get all metadata objects referenced by a given widget.
     *
     * @param widget - widget to get referenced objects for
     * @param types - optional array of object types to include, when not specified, all supported references will
     *  be retrieved
     */
    getWidgetReferencedObjects(
        widget: IWidget,
        types?: SupportedWidgetReferenceTypes[],
    ): Promise<IWidgetReferences>;

    /**
     * Takes a widget and a list of filters and returns filters that can be used for the widget.
     * - for attribute filters, these are filters that should NOT be ignored according to the ignoreDashboardFilters property.
     * - for date filters it is the last filter with the same date dimension as specified in dateDataSet property.
     *
     * The implementation MUST take different ObjRef types into account, for example if an incoming filter
     * uses idRef and an ignoreDashboardFilters item uses uriRef but they point to the same metadata object,
     * the filter MUST NOT be included in the result.
     *
     * @param widget - widget to get filters for
     * @param filters - filters to apply on the widget
     * @returns promise with the filters with the ignored filters removed
     */
    getResolvedFiltersForWidget(widget: IWidget, filters: IFilter[]): Promise<IFilter[]>;
}
