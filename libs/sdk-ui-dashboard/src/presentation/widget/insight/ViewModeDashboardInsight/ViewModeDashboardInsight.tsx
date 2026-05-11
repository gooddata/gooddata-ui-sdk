// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardInsightProps } from "../types.js";

import { DashboardInsightWithDrillDialog } from "./DashboardInsightWithDrillDialog.js";

/**
 * @internal
 */
export function ViewModeDashboardInsight(props: IDashboardInsightProps): ReactElement {
    return <DashboardInsightWithDrillDialog {...props} />;
}
