// (C) 2023-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

export function DashboardScenarioTigerPermissions() {
    // works only when workspace has permissions feature flag turned on
    // and backend permissions ff is activated as well
    return <Dashboard dashboard={idRef(Dashboards.KPIs)} />;
}
