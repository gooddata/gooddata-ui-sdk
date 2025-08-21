// (C) 2025 GoodData Corporation
import React, { ReactElement } from "react";

import { EXPORT_VIS_MINIMAL_HEIGHT, EXPORT_VIS_MINIMAL_WIDTH } from "../../../export/index.js";
import { IDashboardInsightProps } from "../types.js";
import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";

export function ExportModeDashboardInsight(props: IDashboardInsightProps): ReactElement {
    return (
        <DashboardInsight
            {...props}
            minimalWidth={EXPORT_VIS_MINIMAL_WIDTH}
            minimalHeight={EXPORT_VIS_MINIMAL_HEIGHT}
        />
    );
}
