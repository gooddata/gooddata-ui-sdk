// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useDashboardWidgetProps } from "./DashboardWidgetPropsContext";

/**
 * @internal
 */
export const DashboardWidget = (): JSX.Element => {
    const { WidgetComponentProvider } = useDashboardComponentsContext();
    const { widget } = useDashboardWidgetProps();
    const WidgetComponent = WidgetComponentProvider(widget!);

    return <WidgetComponent />;
};
