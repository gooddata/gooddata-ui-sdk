// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardLayoutProps } from "../widget/dashboardLayout/types.js";

import { DefaultFlexibleDashboardLayout } from "./DefaultFlexibleDashboardLayout.js";

/**
 * @alpha
 */
export function DefaultDashboardLayout(props: IDashboardLayoutProps): ReactElement {
    return <DefaultFlexibleDashboardLayout {...props} />;
}
