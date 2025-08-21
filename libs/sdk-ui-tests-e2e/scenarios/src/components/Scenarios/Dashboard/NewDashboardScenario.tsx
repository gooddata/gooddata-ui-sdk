// (C) 2021-2025 GoodData Corporation
import React from "react";

import { Dashboard, DashboardConfig } from "@gooddata/sdk-ui-dashboard";

const config: DashboardConfig = {
    initialRenderMode: "edit",
};

export function NewDashboardScenario() {
    return <Dashboard config={config} />;
}
