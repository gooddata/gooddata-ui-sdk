// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { DashboardInsightWithDrillDialog } from "./DashboardInsightWithDrillDialog.js";
import { IDashboardInsightProps } from "../types.js";

/**
 * @internal
 */
export function ViewModeDashboardInsight(props: IDashboardInsightProps): ReactElement {
    return <DashboardInsightWithDrillDialog {...props} />;
}
