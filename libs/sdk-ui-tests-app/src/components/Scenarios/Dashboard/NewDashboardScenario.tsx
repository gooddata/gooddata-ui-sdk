// (C) 2021-2026 GoodData Corporation

import { Dashboard, type DashboardConfig } from "@gooddata/sdk-ui-dashboard";

const config: DashboardConfig = {
    initialRenderMode: "edit",
};

export function NewDashboardScenario() {
    return <Dashboard config={config} />;
}
