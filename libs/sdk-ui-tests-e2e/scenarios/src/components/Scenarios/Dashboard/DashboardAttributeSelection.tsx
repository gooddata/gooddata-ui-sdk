// (C) 2022-2025 GoodData Corporation
import React from "react";

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const dashboardRef = idRef(Dashboards.DrillToAttributeUrl);

export const DashboardAttributeSelection: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} config={{ initialRenderMode: "edit" }} />;
};
