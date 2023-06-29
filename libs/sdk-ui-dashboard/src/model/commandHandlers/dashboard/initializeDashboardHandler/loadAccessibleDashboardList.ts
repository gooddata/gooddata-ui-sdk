// (C) 2021-2022 GoodData Corporation
import { IListedDashboard } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function loadAccessibleDashboardList(ctx: DashboardContext): Promise<IListedDashboard[]> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().getDashboards({ includeAvailableViaLink: true });
}
