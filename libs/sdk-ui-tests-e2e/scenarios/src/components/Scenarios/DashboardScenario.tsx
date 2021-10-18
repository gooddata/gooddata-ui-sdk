// (C) 2021 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

export const DashboardScenario: React.FC = () => {
    return <Dashboard dashboard={idRef("aab58o6sdLRF")} />;
};
