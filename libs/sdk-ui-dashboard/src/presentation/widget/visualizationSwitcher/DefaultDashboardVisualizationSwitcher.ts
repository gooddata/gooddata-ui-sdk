// (C) 2024-2026 GoodData Corporation

import { EditModeDashboardVisualizationSwitcher } from "./EditModeDashboardVisualizationSwitcher.js";
import { ExportModeDashboardVisualizationSwitcher } from "./ExportModeDashboardVisualizationSwitcher.js";
import { ViewModeDashboardVisualizationSwitcher } from "./ViewModeDashboardVisualizationSwitcher.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

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
