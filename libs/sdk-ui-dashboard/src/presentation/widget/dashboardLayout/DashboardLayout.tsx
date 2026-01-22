// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IDashboardLayoutProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardLayout(props: IDashboardLayoutProps): ReactElement {
    const { LayoutComponent } = useDashboardComponentsContext();

    return <LayoutComponent {...props} />;
}
