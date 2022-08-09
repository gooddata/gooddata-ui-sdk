// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardKpiProps } from "../types";
import { DefaultDashboardKpiWithDrills } from "./DefaultDashboardKpiWithDrills";

/**
 * Default implementation of the Dashboard KPI widget.
 *
 * @public
 */
export const ViewModeDashboardKpi = (props: IDashboardKpiProps): JSX.Element => {
    return <DefaultDashboardKpiWithDrills {...props} />;
};
