// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightProps } from "../types.js";
import { DashboardInsightWithDrillDialog } from "./DashboardInsightWithDrillDialog.js";

/**
 * @internal
 */
export const ViewModeDashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    return <DashboardInsightWithDrillDialog {...props} />;
};
