// (C) 2024-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IDashboardVisualizationSwitcherProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

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
