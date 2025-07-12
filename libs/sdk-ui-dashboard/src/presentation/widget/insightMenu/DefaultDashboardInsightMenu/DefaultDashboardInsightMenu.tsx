// (C) 2020-2025 GoodData Corporation

import { IDashboardInsightMenuProps } from "../types.js";
import { DashboardInsightMenu } from "./DashboardInsightMenu/index.js";

/**
 * @alpha
 */
export function DefaultDashboardInsightMenu(props: IDashboardInsightMenuProps) {
    return <DashboardInsightMenu {...props} />;
}
