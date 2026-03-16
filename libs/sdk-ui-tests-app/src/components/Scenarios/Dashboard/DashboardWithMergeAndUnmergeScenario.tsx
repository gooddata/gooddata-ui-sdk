// (C) 2021-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

const dashboardsRef = idRef(Dashboards.KDWithMergeAndUnmergeInsights);
export function DashboardWithMergeAndUnmergeScenario() {
    return <Dashboard dashboard={dashboardsRef} />;
}
