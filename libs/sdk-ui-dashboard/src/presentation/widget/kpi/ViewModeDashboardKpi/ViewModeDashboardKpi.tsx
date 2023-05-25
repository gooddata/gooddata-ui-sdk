// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardKpiProps } from "../types.js";
import { DefaultDashboardKpiWithDrills } from "./DefaultDashboardKpiWithDrills.js";

/**
 * Default implementation of the Dashboard KPI widget.
 *
 * @public
 */
export const ViewModeDashboardKpi = (props: IDashboardKpiProps): JSX.Element => {
    return <DefaultDashboardKpiWithDrills {...props} />;
};
