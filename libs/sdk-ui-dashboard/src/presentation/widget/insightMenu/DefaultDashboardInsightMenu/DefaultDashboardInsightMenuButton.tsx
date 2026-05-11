// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardInsightMenuButtonProps } from "../types.js";

import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";

/**
 * @internal
 */
export function DefaultDashboardInsightMenuButton(props: IDashboardInsightMenuButtonProps): ReactElement {
    return <DashboardInsightMenuButton {...props} />;
}
