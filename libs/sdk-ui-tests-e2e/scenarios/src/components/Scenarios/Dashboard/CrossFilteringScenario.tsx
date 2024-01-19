// (C) 2023-2024 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const dashboardRef = idRef(Dashboards.CrossFiltering);

export const CrossFilteringScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} />;
};
