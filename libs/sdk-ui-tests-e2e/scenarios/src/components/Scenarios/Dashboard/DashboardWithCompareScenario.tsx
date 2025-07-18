// (C) 2021-2025 GoodData Corporation

import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const dashboardsRef = idRef(Dashboards.KDWithCompares);
export function DashboardWithCompareScenario() {
    return <Dashboard dashboard={dashboardsRef} />;
}
