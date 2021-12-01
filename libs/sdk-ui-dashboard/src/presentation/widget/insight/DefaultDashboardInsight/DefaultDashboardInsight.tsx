// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightProps } from "../types";
import { DashboardInsightWithDrillDialog } from "./DashboardInsightWithDrillDialog";

/**
 * Default implementation of the Dashboard Insight widget.
 *
 * @public
 */
export const DefaultDashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    return <DashboardInsightWithDrillDialog {...props} />;
};
