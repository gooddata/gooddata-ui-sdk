// (C) 2021-2025 GoodData Corporation
import { type IListedDashboard } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export function loadDashboardList({ backend, workspace }: DashboardContext): Promise<IListedDashboard[]> {
    return backend.workspace(workspace).dashboards().getDashboards();
}
