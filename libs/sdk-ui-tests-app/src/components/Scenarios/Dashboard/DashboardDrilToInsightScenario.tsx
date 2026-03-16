// (C) 2021-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import * as TigerMDObjects from "@gooddata/sdk-ui-tests-reference-workspace/current_tiger";

export const MDObject = TigerMDObjects;

export function DashboardDrillToInsightScenario() {
    return <Dashboard dashboard={idRef(MDObject.Dashboards.DrillToInsight)} />;
}
