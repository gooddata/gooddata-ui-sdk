// (C) 2022-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "@gooddata/sdk-ui-tests-reference-workspace/current_bear";

const dashboardRef = idRef(Dashboards.DrillToAttributeUrl);

export function DashboardAttributeSelection() {
    return <Dashboard dashboard={dashboardRef} config={{ initialRenderMode: "edit" }} />;
}
