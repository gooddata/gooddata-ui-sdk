// (C) 2025 GoodData Corporation
import React from "react";

import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";
import { IDashboardInsightProps } from "../types.js";

export const ExportModeDashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    return <DashboardInsight {...props} />;
};
