// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";

/**
 * @internal
 */
export const DashboardKpi = (): JSX.Element => {
    const { KpiComponent } = useDashboardComponentsContext();

    return <KpiComponent />;
};
