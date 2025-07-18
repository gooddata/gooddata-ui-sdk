// (C) 2022-2025 GoodData Corporation
import { ReactElement } from "react";

import { DashboardInsight } from "../ViewModeDashboardInsight/Insight/DashboardInsight.js";
import { IDashboardInsightProps } from "../types.js";

/**
 * @internal
 */
export function EditModeDashboardInsight(props: IDashboardInsightProps): ReactElement {
    return <DashboardInsight {...props} />;
}
