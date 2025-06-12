// (C) 2022-2023 GoodData Corporation

import { IDashboardPermissions } from "@gooddata/sdk-model";

/**
 * @public
 */
export interface DashboardPermissionsState {
    /** @beta */
    dashboardPermissions?: IDashboardPermissions;
}

export const dashboardPermissionsInitialState: DashboardPermissionsState = {
    dashboardPermissions: undefined,
};
