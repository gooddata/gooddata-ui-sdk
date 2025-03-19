// (C) 2024-2025 GoodData Corporation

import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardVisualizationSwitcherWidget } from "./DefaultDashboardVisualizationSwitcherWidget.js";
import { EditableDashboardVisualizationSwitcherWidget } from "./EditableDashboardVisualizationSwitcherWidget.js";
import { ExportableDashboardVisualizationSwitcherWidget } from "./ExportableDashboardVisualizationSwitcherWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardVisualizationSwitcherWidget = renderModeAware({
    view: DefaultDashboardVisualizationSwitcherWidget,
    edit: EditableDashboardVisualizationSwitcherWidget,
    export: ExportableDashboardVisualizationSwitcherWidget,
});
