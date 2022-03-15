// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Dashboard, DashboardConfig } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const dashboardRef = idRef("aeO5PVgShc0T");
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

const SimpleDashboardComponent: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} config={config} />;
};

export default SimpleDashboardComponent;
