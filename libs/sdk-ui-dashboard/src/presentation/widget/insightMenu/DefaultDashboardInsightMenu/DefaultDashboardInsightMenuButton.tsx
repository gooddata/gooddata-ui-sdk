// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";
import { IDashboardInsightMenuButtonProps } from "../types.js";

/**
 * @internal
 */
export function DefaultDashboardInsightMenuButton(props: IDashboardInsightMenuButtonProps): ReactElement {
    return <DashboardInsightMenuButton {...props} />;
}
