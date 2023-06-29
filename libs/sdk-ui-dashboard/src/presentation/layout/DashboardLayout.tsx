// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { IDashboardLayoutProps } from "./types.js";

/**
 * @internal
 */
export const DashboardLayout = (props: IDashboardLayoutProps): JSX.Element => {
    const { LayoutComponent } = useDashboardComponentsContext();

    return <LayoutComponent {...props} />;
};
