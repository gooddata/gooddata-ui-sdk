// (C) 2023-2024 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { Dashboards } from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

export const DashboardRichTextScenario: React.FC = () => {
    return <Dashboard dashboard={Dashboards.RichText} />;
};
