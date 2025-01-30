// (C) 2024-2025 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/index.js";
import { EditModeDashboardVisualizationSwitcher } from "./EditModeDashboardVisualizationSwitcher.js";
import { ExportModeDashboardVisualizationSwitcher } from "./ExportModeDashboardVisualizationSwitcher.js";
import { ViewModeDashboardVisualizationSwitcher } from "./ViewModeDashboardVisualizationSwitcher.js";

/**
 * Default implementation of the dashboard visualization switcher widget.
 *
 * @public
 */
export const DefaultDashboardVisualizationSwitcher = renderModeAware({
    view: ViewModeDashboardVisualizationSwitcher,
    edit: EditModeDashboardVisualizationSwitcher,
    export: ExportModeDashboardVisualizationSwitcher,
});
