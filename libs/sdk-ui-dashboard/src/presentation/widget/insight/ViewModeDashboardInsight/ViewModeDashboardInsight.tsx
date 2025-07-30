// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IDashboardInsightProps } from "../types.js";
import { DashboardInsightWithDrillDialog } from "./DashboardInsightWithDrillDialog.js";

/**
 * @internal
 */
export const ViewModeDashboardInsight = (props: IDashboardInsightProps): ReactElement => {
    return <DashboardInsightWithDrillDialog {...props} />;
};
