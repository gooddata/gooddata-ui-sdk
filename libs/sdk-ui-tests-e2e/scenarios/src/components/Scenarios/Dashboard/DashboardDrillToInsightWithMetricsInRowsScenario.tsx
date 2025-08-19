// (C) 2021-2025 GoodData Corporation
import React from "react";

import { idRef } from "@gooddata/sdk-model";
import { Dashboard, DashboardConfig } from "@gooddata/sdk-ui-dashboard";

import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const dashboardRef = idRef(Dashboards.MetricsInRows);

const config: DashboardConfig = {
    settings: {
        enablePivotTableTransposition: true,
        enableColumnHeadersPosition: true,
        enableKPIDashboardDrillToInsight: true,
    },
};

export const DashboardDrillToInsightWithMetricsInRowsScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} config={config} />;
};
