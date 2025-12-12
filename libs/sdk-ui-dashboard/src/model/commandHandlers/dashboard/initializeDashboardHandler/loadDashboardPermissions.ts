// (C) 2021-2025 GoodData Corporation
import { type IDashboardPermissions } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export function loadDashboardPermissions({
    backend,
    workspace,
    dashboardRef,
}: DashboardContext): Promise<IDashboardPermissions> {
    return backend.workspace(workspace).dashboards().getDashboardPermissions(dashboardRef!);
}
