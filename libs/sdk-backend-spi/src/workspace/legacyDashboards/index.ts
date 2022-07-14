// (C) 2022 GoodData Corporation
import { ILegacyDashboard } from "@gooddata/sdk-model";

/**
 * Service to list legacy dashboards
 *
 * @alpha
 */
export interface IWorkspaceLegacyDashboardsService {
    /**
     * Gets all legacy dashboards available in current workspace.
     *
     * @returns promise of list of the dashboards
     */
    getLegacyDashboards(): Promise<ILegacyDashboard[]>;
}
