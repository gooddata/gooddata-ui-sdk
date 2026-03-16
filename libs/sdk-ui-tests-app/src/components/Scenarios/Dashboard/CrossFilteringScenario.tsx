// (C) 2023-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

const dashboardRef = idRef(Dashboards.CrossFiltering);

export function CrossFilteringScenario() {
    return <Dashboard dashboard={dashboardRef} />;
}
