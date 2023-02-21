// (C) 2021-2023 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const DashboardScenarioTigerPermissions: React.FC = () => {
    // works only when workspace has earlyAccess=develop
    // and backend permissions ff is activated as well
    const config = {
        settings: {
            enableAnalyticalDashboardPermissions: true,
        },
    };
    return <Dashboard config={config} dashboard={idRef(Dashboards.KPIs)} />;
};
