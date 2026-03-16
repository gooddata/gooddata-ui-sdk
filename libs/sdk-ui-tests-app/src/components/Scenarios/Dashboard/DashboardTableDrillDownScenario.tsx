// (C) 2021-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_bear";

const dashboardRef = idRef(Dashboards.DashboardTableDrillDown);

export function DashboardTableDrillDown() {
    return <Dashboard dashboard={dashboardRef} />;
}
