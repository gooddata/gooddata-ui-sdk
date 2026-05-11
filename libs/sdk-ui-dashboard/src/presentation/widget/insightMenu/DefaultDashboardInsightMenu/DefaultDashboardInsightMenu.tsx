// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardInsightMenuProps } from "../types.js";

import { DashboardInsightMenu } from "./DashboardInsightMenu/index.js";

/**
 * @alpha
 */
export function DefaultDashboardInsightMenu(props: IDashboardInsightMenuProps): ReactElement {
    return <DashboardInsightMenu {...props} />;
}
