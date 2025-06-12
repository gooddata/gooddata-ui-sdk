// (C) 2025 GoodData Corporation
import React from "react";

import { EXPORT_VIS_MINIMAL_HEIGHT, EXPORT_VIS_MINIMAL_WIDTH } from "../../../export/index.js";
import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";
import { IDashboardInsightProps } from "../types.js";

export const ExportModeDashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    return (
        <DashboardInsight
            {...props}
            minimalWidth={EXPORT_VIS_MINIMAL_WIDTH}
            minimalHeight={EXPORT_VIS_MINIMAL_HEIGHT}
        />
    );
};
