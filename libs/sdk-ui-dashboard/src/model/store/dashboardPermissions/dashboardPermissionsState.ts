// (C) 2022-2026 GoodData Corporation

import { type IDashboardPermissions } from "@gooddata/sdk-model";

/**
 * @public
 */
export type DashboardPermissionsState = {
    /** @beta */
    dashboardPermissions?: IDashboardPermissions;
};

export const dashboardPermissionsInitialState: DashboardPermissionsState = {
    dashboardPermissions: undefined,
};
