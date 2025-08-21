// (C) 2023-2025 GoodData Corporation
import React from "react";

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export function DashboardScenarioTigerPermissions() {
    // works only when workspace has permissions feature flag turned on
    // and backend permissions ff is activated as well
    return <Dashboard dashboard={idRef(Dashboards.KPIs)} />;
}
