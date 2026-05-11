// (C) 2024-2026 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

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
