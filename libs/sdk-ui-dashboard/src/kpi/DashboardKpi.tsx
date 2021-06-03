// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboard/DashboardComponentsContext";
import { DashboardKpiProps } from "./types";

/**
 * @internal
 */
export const DashboardKpi = (props: DashboardKpiProps): JSX.Element => {
    const { KpiComponent } = useDashboardComponentsContext({});

    return <KpiComponent {...props} />;
};
