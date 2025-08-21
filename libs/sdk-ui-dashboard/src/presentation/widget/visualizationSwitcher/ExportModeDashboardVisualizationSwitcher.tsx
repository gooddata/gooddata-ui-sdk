// (C) 2025 GoodData Corporation
import React from "react";

import { IDashboardVisualizationSwitcherProps } from "./types.js";
import { ViewModeDashboardVisualizationSwitcher } from "./ViewModeDashboardVisualizationSwitcher.js";

/**
 * @internal
 */
export function ExportModeDashboardVisualizationSwitcher(props: IDashboardVisualizationSwitcherProps) {
    return <ViewModeDashboardVisualizationSwitcher {...props} />;
}
