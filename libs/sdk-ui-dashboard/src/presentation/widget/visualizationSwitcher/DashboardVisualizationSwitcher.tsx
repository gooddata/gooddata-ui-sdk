// (C) 2024 GoodData Corporation

import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardVisualizationSwitcherProps } from "./types.js";

/**
 * @internal
 */
export const DashboardVisualizationSwitcher = (props: IDashboardVisualizationSwitcherProps): JSX.Element => {
    const { widget } = props;
    const { VisualizationSwitcherWidgetComponentSet } = useDashboardComponentsContext();
    const VisualizationSwitcherComponent = useMemo(
        () => VisualizationSwitcherWidgetComponentSet.MainComponentProvider(widget),
        [VisualizationSwitcherWidgetComponentSet, widget],
    );

    return <VisualizationSwitcherComponent {...props} />;
};
