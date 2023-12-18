// (C) 2023 GoodData Corporation
import React from "react";
import { Dashboard, DashboardConfig } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const config: DashboardConfig = {
    settings: {
        enableKPIDashboardDrillToDashboard: true,
        enableKPIDashboardDrillToInsight: true,
        enableKPIDashboardDrillToURL: true,
        enableKPIDashboardImplicitDrillDown: true,
        enableKPIDashboardDrillFromAttribute: true,
        enableKDCrossFiltering: true,
    },
};

export const CrossFilteringScenario: React.FC = () => {
    return <Dashboard dashboard={idRef(Dashboards.CrossFiltering)} config={config} />;
};
