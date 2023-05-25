// (C) 2021-2023 GoodData Corporation
import { IDashboardPermissions } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function loadDashboardPermissions(ctx: DashboardContext): Promise<IDashboardPermissions> {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardPermissions(dashboardRef!);
}
