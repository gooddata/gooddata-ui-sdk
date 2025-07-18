// (C) 2022-2025 GoodData Corporation
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("aajDsp1uCHcX");

export function DashboardFilterConfigurationScenario() {
    return <Dashboard dashboard={dashboardRef} config={{ initialRenderMode: "edit" }} />;
}
