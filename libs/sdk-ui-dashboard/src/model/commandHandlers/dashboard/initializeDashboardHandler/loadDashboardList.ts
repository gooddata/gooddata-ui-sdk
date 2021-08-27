// (C) 2021 GoodData Corporation
import { IListedDashboard } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../../../types/commonTypes";

export function loadDashboardList(ctx: DashboardContext): Promise<IListedDashboard[]> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().getDashboards();
}
