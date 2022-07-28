// (C) 2022 GoodData Corporation
import React from "react";

import { DashboardInsight } from "../DefaultDashboardInsight/Insight/DashboardInsight";
import { IDashboardInsightProps } from "../types";

/**
 * @internal
 */
export const EditableDashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    return <DashboardInsight {...props} />;
};
