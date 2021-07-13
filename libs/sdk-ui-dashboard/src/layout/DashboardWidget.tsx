// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboardContexts";

/**
 * @internal
 */
export const DashboardWidget = (): JSX.Element => {
    const { WidgetComponent } = useDashboardComponentsContext();

    return <WidgetComponent />;
};
