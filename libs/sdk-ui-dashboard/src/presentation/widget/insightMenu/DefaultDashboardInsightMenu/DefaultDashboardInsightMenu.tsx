// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { IDashboardInsightMenuProps } from "../types.js";
import { DashboardInsightMenu } from "./DashboardInsightMenu/index.js";

/**
 * @alpha
 */
export function DefaultDashboardInsightMenu(props: IDashboardInsightMenuProps): ReactElement {
    return <DashboardInsightMenu {...props} />;
}
