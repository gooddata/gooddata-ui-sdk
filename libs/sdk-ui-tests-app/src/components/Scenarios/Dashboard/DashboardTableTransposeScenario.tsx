// (C) 2023-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

const dashboardRef = idRef(Dashboards.KDWithTableTranspose);

export function DashboardTableTranspose() {
    return <Dashboard dashboard={dashboardRef} />;
}
