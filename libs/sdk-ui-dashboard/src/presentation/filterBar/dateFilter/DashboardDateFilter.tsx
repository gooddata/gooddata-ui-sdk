// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";

/**
 * @internal
 */
export const DashboardDateFilter = (): JSX.Element => {
    const { DashboardDateFilterComponent } = useDashboardComponentsContext();

    return <DashboardDateFilterComponent />;
};
