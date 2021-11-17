// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { IDashboardDateFilterProps } from "./types";

/**
 * @internal
 */
export const DashboardDateFilter = (props: IDashboardDateFilterProps): JSX.Element => {
    const { DashboardDateFilterComponent } = useDashboardComponentsContext();

    return <DashboardDateFilterComponent {...props} />;
};
