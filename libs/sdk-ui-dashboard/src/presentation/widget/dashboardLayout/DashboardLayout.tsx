// (C) 2020-2024 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardLayoutProps } from "../../flexibleLayout/types.js";

/**
 * @internal
 */
export const DashboardLayout = (props: IDashboardLayoutProps): JSX.Element => {
    const { LayoutComponent } = useDashboardComponentsContext();

    return <LayoutComponent {...props} />;
};
