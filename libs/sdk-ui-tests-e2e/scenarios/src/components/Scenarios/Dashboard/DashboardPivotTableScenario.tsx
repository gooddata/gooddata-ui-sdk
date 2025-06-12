// (C) 2023-2024 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import * as TigerMDObjects from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const MDObject = TigerMDObjects as TigerMDObjects;

export const DashboardPivotTableScenario: React.FC = () => {
    return <Dashboard dashboard={idRef(MDObject.Dashboards.PivotTableDashboard)} />;
};
