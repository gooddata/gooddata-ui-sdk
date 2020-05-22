// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IListedDashboard, IDashboard, IDashboardDefinition } from "./dashboard";

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
}
