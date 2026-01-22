// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { DefaultFlexibleDashboardLayout } from "./DefaultFlexibleDashboardLayout.js";
import { type IDashboardLayoutProps } from "../widget/dashboardLayout/types.js";

/**
 * @alpha
 */
export function DefaultDashboardLayout(props: IDashboardLayoutProps): ReactElement {
    return <DefaultFlexibleDashboardLayout {...props} />;
}
