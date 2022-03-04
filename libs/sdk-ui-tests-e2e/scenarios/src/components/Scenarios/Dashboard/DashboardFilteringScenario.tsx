// (C) 2021-2022 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("aaw44pxZplIi");

export const DashboardFilteringScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} />;
};
