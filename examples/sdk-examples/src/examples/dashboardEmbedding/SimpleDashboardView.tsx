// (C) 2007-2018 GoodData Corporation
import React from "react";
import { DashboardView } from "@gooddata/sdk-ui-ext/esm/internal";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("aeO5PVgShc0T");

const SimpleDashboardView: React.FC = () => {
    return <DashboardView dashboard={dashboardRef} />;
};

export default SimpleDashboardView;
