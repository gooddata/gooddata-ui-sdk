// (C) 2024-2025 GoodData Corporation

import { ReactElement, useMemo } from "react";

import { IDashboardVisualizationSwitcherProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function DashboardVisualizationSwitcher(props: IDashboardVisualizationSwitcherProps): ReactElement {
    const { widget } = props;
    const { VisualizationSwitcherWidgetComponentSet } = useDashboardComponentsContext();
    const VisualizationSwitcherComponent = useMemo(
        () => VisualizationSwitcherWidgetComponentSet.MainComponentProvider(widget),
        [VisualizationSwitcherWidgetComponentSet, widget],
    );

    return <VisualizationSwitcherComponent {...props} />;
}
