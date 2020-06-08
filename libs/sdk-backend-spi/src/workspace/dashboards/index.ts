// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IListedDashboard, IDashboard, IDashboardDefinition } from "./dashboard";
import { IWidgetAlert, IWidgetAlertDefinition, IWidgetAlertCount } from "./alert";
import { IScheduledMail, IScheduledMailDefinition } from "./scheduledMail";
import { IFilterContextDefinition } from "./filterContext";

/**
 * Service to list, create and update analytical dashboards
 *
 * @alpha
 */
export interface IWorkspaceDashboards {
    readonly workspace: string;

    /**
     * Queries workspace dashboards
     *
     * @returns promise of list of the dashboards
     */
    getDashboards(): Promise<IListedDashboard[]>;

    /**
     * Load dashboard by it's reference,
     * and optionally override filter context with the custom filter context
     * (custom filter context is used mainly for exporting)
     *
     * @param ref - dashboard ref
     * @param filterContextRef - Override dashboard filter context with the custom filter context
     * (This allows to modify filter context when exporting the dashboard)
     * @returns promise of the dashboard
     */
    getDashboard(ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard>;

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
     * @param ref - dashboard ref
     * @returns promise
     */
    deleteDashboard(ref: ObjRef): Promise<void>;

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
     * @param dashboardRef - dashboard reference
     * @returns promise with the number of scheduled emails connected to the dashborad
     */
    getScheduledMailsCountForDashboard(dashboardRef: ObjRef): Promise<number>;

    /**
     * Get all widget alerts for the current user
     *
     * @returns promise with all user widget alerts
     */
    getAllWidgetAlertsForCurrentUser(): Promise<IWidgetAlert[]>;

    /**
     * Get the number of widget alerts (created by any user) for particular widgets
     *
     * @param refs - widget refs
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
    bulkDeleteWidgetAlerts(refs: ObjRef[]): Promise<void>;
}
