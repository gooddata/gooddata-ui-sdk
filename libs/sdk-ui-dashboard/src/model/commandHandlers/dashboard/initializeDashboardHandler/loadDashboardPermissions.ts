// (C) 2021-2022 GoodData Corporation
import { IDashboardPermissions } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes";

export function loadDashboardPermissions(ctx: DashboardContext): Promise<IDashboardPermissions> {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardPermissions(dashboardRef!);
}
