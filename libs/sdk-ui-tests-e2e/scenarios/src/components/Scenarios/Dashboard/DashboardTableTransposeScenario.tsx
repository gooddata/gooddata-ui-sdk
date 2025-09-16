// (C) 2023-2025 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const dashboardRef = idRef(Dashboards.KDWithTableTranspose);

export function DashboardTableTranspose() {
    return <Dashboard dashboard={dashboardRef} />;
}
