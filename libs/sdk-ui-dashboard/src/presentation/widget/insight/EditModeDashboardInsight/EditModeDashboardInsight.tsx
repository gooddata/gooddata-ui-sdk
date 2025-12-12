// (C) 2022-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardInsightProps } from "../types.js";
import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";

/**
 * @internal
 */
export function EditModeDashboardInsight(props: IDashboardInsightProps): ReactElement {
    return <DashboardInsight {...props} />;
}
