// (C) 2022-2024 GoodData Corporation
import React from "react";

import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";
import { IDashboardInsightProps } from "../types.js";

/**
 * @internal
 */
export const EditModeDashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    console.log("props", props);
    return <DashboardInsight {...props} />;
};
