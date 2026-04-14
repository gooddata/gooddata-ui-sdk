// (C) 2023-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

export function DashboardScenarioTigerShareEveryonePermission() {
    // Dedicated dashboard route for share-to-everyone E2E; uses ParentDashboard to avoid
    // clashing with dashboard-tiger-permissions (KPIs) in parallel integrated runs.
    return <Dashboard dashboard={idRef(Dashboards.ParentDashboard)} />;
}
