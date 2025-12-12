// (C) 2022-2023 GoodData Corporation

import { type IDashboardPermissions } from "@gooddata/sdk-model";

export type TigerDashboardPermissionType = "VIEW" | "SHARE" | "EDIT";

export function buildDashboardPermissions(
    permissions: Array<TigerDashboardPermissionType>,
): IDashboardPermissions {
    const canEditDashboard = hasPermission(permissions, "EDIT");
    const canShareDashboard = canEditDashboard || hasPermission(permissions, "SHARE");
    const canViewDashboard = canShareDashboard || hasPermission(permissions, "VIEW");

    return {
        canEditDashboard,
        canEditLockedDashboard: false,
        canShareDashboard,
        canShareLockedDashboard: canShareDashboard,
        canViewDashboard,
    };
}

function hasPermission(permissions: Array<TigerDashboardPermissionType>, need: TigerDashboardPermissionType) {
    return permissions.indexOf(need) >= 0;
}
