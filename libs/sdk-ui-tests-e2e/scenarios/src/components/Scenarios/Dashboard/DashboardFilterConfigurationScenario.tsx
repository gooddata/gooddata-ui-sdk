// (C) 2022-2025 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

const dashboardRef = idRef("aajDsp1uCHcX");

export function DashboardFilterConfigurationScenario() {
    return <Dashboard dashboard={dashboardRef} config={{ initialRenderMode: "edit" }} />;
}
