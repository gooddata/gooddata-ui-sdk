// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IDashboardLayoutProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function DashboardLayout(props: IDashboardLayoutProps): ReactElement {
    const { LayoutComponent } = useDashboardComponentsContext();

    return <LayoutComponent {...props} />;
}
