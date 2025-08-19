// (C) 2022-2025 GoodData Corporation
import React from "react";

import { idRef } from "@gooddata/sdk-model";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

const dashboardRef = idRef("aajDsp1uCHcX");

export const DashboardFilterConfigurationScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} config={{ initialRenderMode: "edit" }} />;
};
