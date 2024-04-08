// (C) 2021-2024 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "../../../../../../sdk-model";
import * as TigerMDObjects from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const MDObject = TigerMDObjects as TigerMDObjects;

export const DashboardKPIsScenario: React.FC = () => {
    return <Dashboard dashboard={idRef(MDObject.Dashboards.KPIs)} />;
};
