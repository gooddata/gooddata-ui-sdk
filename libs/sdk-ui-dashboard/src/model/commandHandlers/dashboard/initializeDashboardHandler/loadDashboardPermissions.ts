// (C) 2021-2025 GoodData Corporation
import { IDashboardPermissions } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";

export function loadDashboardPermissions({
    backend,
    workspace,
    dashboardRef,
}: DashboardContext): Promise<IDashboardPermissions> {
    return backend.workspace(workspace).dashboards().getDashboardPermissions(dashboardRef!);
}
