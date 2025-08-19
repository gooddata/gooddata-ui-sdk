// (C) 2025 GoodData Corporation
import React from "react";

import { IDashboardVisualizationSwitcherProps } from "./types.js";
import { ViewModeDashboardVisualizationSwitcher } from "./ViewModeDashboardVisualizationSwitcher.js";

/**
 * @internal
 */
export const ExportModeDashboardVisualizationSwitcher: React.FC<IDashboardVisualizationSwitcherProps> = (
    props,
) => {
    return <ViewModeDashboardVisualizationSwitcher {...props} />;
};
