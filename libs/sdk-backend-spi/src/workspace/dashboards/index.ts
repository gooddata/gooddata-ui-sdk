// (C) 2019-2022 GoodData Corporation
import { IFilter, ObjRef } from "@gooddata/sdk-model";
import {
    IDashboard,
    IDashboardDefinition,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardReferences,
    IDashboardWithReferences,
    IListedDashboard,
} from "./dashboard";
import { IWidgetAlert, IWidgetAlertCount, IWidgetAlertDefinition } from "./alert";
import { IScheduledMail, IScheduledMailDefinition } from "./scheduledMail";
import { FilterContextItem, IFilterContextDefinition } from "./filterContext";
import { IWidget, IWidgetReferences, SupportedWidgetReferenceTypes } from "./widget";

/**
 * Configuration options for getting dashboards.
 *
 * @alpha
 */
export interface IGetDashboardOptions {
    /**
     * Optionally specify if information about the users that created/modified the dashboard should be loaded.
     * Defaults to false.
     *
     * If user is inactive or logged in user has not rights to access this information than users that created/modified is undefined.
     */
    loadUserData?: boolean;

    /**
     * Optionally specify if also dashboards available only via link should be loaded.
     * Such dashboards may not be supported by every backend.
     *
     * Defaults to false.
     */
    includeAvailableViaLink?: boolean;
}

/**
 * Configuration options for getting scheduled mails.
 *
 * @alpha
 */
export interface IGetScheduledMailOptions {
    /**
     * Optionally list only subset of scheduled mails authored by current user.
     *
     * Defaults to false.
     */
    createdByCurrentUser?: boolean;
}

/**
 * @alpha
 */
export type SupportedDashboardReferenceTypes = "insight" | "dashboardPlugin";

/**
 * Service to list, create and update analytical dashboards
 *
 * @alpha
 */
export interface IWorkspaceDashboardsService {
    readonly workspace: string;

    /**
     * Gets all dashboards available in current workspace.
     *
     * @param options - optionally specify additional options
     * @returns promise of list of the dashboards
     */
    getDashboards(options?: IGetDashboardOptions): Promise<IListedDashboard[]>;

    /**
     * Load dashboard by its reference,
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
     * Loads a dashboard and objects that the dashboard references.
     *
     * @param ref - dashboard ref
     * @param filterContextRef - Override dashboard filter context with the custom filter context
     * (This allows to modify filter context when exporting the dashboard)
     * @param options - optionally specify additional options
     * @param types - types of dashboard references to load; if the types are undefined, the service
     *  must default to loading insights related to the dashboard
     * @returns promise of the dashboard and references
     */
    getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardWithReferences>;

    /**
     * Get objects referenced by a given dashboard.
     *
     * @param dashboard - dashboard to get referenced objects for
     * @param types - optional array of object types to include, when not specified, all supported references will
     *  be retrieved
     */
    getDashboardReferencedObjects(
        dashboard: IDashboard,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardReferences>;

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
     * Get scheduled emails for particular dashboard
     *
     * @param ref - dashboard reference
     * @param options - optionally specify additional options
     * @returns promise with scheduled emails connected to the dashboard
     */
    getScheduledMailsForDashboard(ref: ObjRef, options?: IGetScheduledMailOptions): Promise<IScheduledMail[]>;

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

    /**
     * Gets all dashboard plugins registered in the current workspace.
     */
    getDashboardPlugins(): Promise<IDashboardPlugin[]>;

    /**
     * Load dashboard plugin by it's reference.
     *
     * @param ref - plugin reference
     */
    getDashboardPlugin(ref: ObjRef): Promise<IDashboardPlugin>;

    /**
     * Creates a record about a dashboard plugin. Creating a new dashboard plugin does not impact any
     * existing dashboards in the workspace.
     *
     * In order to use a plugin on a dashboard, you need to create a link between the dashboard and the
     * plugin. Multiple dashboards may link to a single plugin; each dashboard may link to the plugin with
     * different plugin-specific parameters.
     *
     * @remarks
     * Analytical Backend only allows creating new dashboard plugins or deleting existing plugins. The goal
     * behind this decision is to encourage safe, phased rollout of new plugin versions. You must first
     * create a new dashboard plugin and then explicitly start using this new version on dashboards in
     * order for changes to take effect.
     *
     * @param plugin - definition of plugin to create
     */
    createDashboardPlugin(plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin>;

    /**
     * Deletes a record about a dashboard plugin from the backend.
     *
     * @remarks
     * -  some backend implementations may reject to delete a dashboard plugin that is used on existing dashboards
     *
     * @param ref - reference to plugin to
     */
    deleteDashboardPlugin(ref: ObjRef): Promise<void>;
}
