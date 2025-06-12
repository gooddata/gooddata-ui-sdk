// (C) 2021-2023 GoodData Corporation

import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const dashboardsRef = idRef(Dashboards.KDWithNoData);
export const DashboardWithNoDataScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardsRef} />;
};
