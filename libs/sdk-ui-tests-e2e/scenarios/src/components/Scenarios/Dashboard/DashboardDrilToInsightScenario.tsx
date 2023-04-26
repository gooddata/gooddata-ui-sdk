// (C) 2021-2023 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

let dashboardRef: string;

if (process.env.SDK_BACKEND === "TIGER") {
    import(
        "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger"
    ).then((module) => {
        dashboardRef = module.Dashboards.DrillToInsight;
    });
} else if (process.env.SDK_BACKEND === "BEAR") {
    import(
        "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear"
    ).then((module) => {
        dashboardRef = module.Dashboards.DrillToInsight;
    });
}

export const DashboardDrillToInsightScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} />;
};
