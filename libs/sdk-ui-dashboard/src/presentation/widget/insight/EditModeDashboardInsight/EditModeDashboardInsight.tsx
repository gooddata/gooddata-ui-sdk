// (C) 2022-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IDashboardInsightProps } from "../types.js";
import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";

/**
 * @internal
 */
export const EditModeDashboardInsight = (props: IDashboardInsightProps): ReactElement => {
    return <DashboardInsight {...props} />;
};
