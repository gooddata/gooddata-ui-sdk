// (C) 2022-2025 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("aajDsp1uCHcX");

export const DashboardFilterConfigurationScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} config={{ settings: { enableSlideshowExports: true } }} />;
};
