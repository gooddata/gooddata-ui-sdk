// (C) 2022 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { ISidebarProps } from "./types";

export const DashboardSidebar = (props: ISidebarProps): JSX.Element => {
    const { SidebarComponent } = useDashboardComponentsContext();

    return <SidebarComponent {...props} />;
};
