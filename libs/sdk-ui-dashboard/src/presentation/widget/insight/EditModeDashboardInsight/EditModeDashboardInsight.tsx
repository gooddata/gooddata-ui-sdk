// (C) 2022-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";
import { IDashboardInsightProps } from "../types.js";

/**
 * @internal
 */
export const EditModeDashboardInsight = (props: IDashboardInsightProps): ReactElement => {
    return <DashboardInsight {...props} />;
};
