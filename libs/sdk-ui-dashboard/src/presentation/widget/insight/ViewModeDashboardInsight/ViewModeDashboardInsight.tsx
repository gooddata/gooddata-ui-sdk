// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";

import { IDashboardInsightProps } from "../types.js";
import { DashboardInsightWithDrillDialog } from "./DashboardInsightWithDrillDialog.js";

/**
 * @internal
 */
export function ViewModeDashboardInsight(props: IDashboardInsightProps): ReactElement {
    return <DashboardInsightWithDrillDialog {...props} />;
}
