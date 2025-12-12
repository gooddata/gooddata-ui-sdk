// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";
import { type IDashboardInsightMenuButtonProps } from "../types.js";

/**
 * @internal
 */
export function DefaultDashboardInsightMenuButton(props: IDashboardInsightMenuButtonProps): ReactElement {
    return <DashboardInsightMenuButton {...props} />;
}
