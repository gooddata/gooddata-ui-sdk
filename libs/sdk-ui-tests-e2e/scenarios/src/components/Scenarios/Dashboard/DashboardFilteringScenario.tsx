// (C) 2021-2022 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const dashboardRef = idRef(Dashboards.TestDashboard);

export const DashboardFilteringScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} />;
};
