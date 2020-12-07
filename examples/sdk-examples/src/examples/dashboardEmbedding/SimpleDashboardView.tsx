// (C) 2007-2018 GoodData Corporation
import React from "react";
import { DashboardView } from "@gooddata/sdk-ui-ext/esm/internal";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const dashboardRef = idRef("aeO5PVgShc0T");
const config = { mapboxToken: MAPBOX_TOKEN };

const SimpleDashboardView: React.FC = () => {
    return <DashboardView dashboard={dashboardRef} config={config} />;
};

export default SimpleDashboardView;
