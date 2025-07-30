// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

import { IDashboardLayoutProps } from "./types.js";

/**
 * @internal
 */
export const DashboardLayout = (props: IDashboardLayoutProps): ReactElement => {
    const { LayoutComponent } = useDashboardComponentsContext();

    return <LayoutComponent {...props} />;
};
