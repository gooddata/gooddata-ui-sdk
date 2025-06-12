// (C) 2021-2023 GoodData Corporation
import React from "react";
import { Dashboard, DashboardConfig } from "@gooddata/sdk-ui-dashboard";

const config: DashboardConfig = {
    initialRenderMode: "edit",
};

export const NewDashboardScenario: React.FC = () => {
    return <Dashboard config={config} />;
};
