// (C) 2020-2025 GoodData Corporation
import { ReactElement } from "react";

import { IDashboardInsightMenuButtonProps } from "../types.js";
import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";

/**
 * @internal
 */
export function DefaultDashboardInsightMenuButton(props: IDashboardInsightMenuButtonProps): ReactElement {
    return <DashboardInsightMenuButton {...props} />;
}
