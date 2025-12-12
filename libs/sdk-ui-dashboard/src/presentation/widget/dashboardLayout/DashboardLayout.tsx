// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardLayoutProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function DashboardLayout(props: IDashboardLayoutProps): ReactElement {
    const { LayoutComponent } = useDashboardComponentsContext();

    return <LayoutComponent {...props} />;
}
