// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { DefaultFlexibleDashboardLayout } from "./DefaultFlexibleDashboardLayout.js";
import { IDashboardLayoutProps } from "./types.js";

/**
 * @alpha
 */
export function DefaultDashboardLayout(props: IDashboardLayoutProps): ReactElement {
    return <DefaultFlexibleDashboardLayout {...props} />;
}
