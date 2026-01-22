// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { EXPORT_VIS_MINIMAL_HEIGHT, EXPORT_VIS_MINIMAL_WIDTH } from "../../../export/const.js";
import { type IDashboardInsightProps } from "../types.js";
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
