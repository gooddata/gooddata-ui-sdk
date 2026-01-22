// (C) 2024-2026 GoodData Corporation

import { DefaultDashboardVisualizationSwitcherWidget } from "./DefaultDashboardVisualizationSwitcherWidget.js";
import { EditableDashboardVisualizationSwitcherWidget } from "./EditableDashboardVisualizationSwitcherWidget.js";
import { ExportableDashboardVisualizationSwitcherWidget } from "./ExportableDashboardVisualizationSwitcherWidget.js";
import { renderModeAware } from "../../../componentDefinition/renderModeAware.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardVisualizationSwitcherWidget = renderModeAware({
    view: DefaultDashboardVisualizationSwitcherWidget,
    edit: EditableDashboardVisualizationSwitcherWidget,
    export: ExportableDashboardVisualizationSwitcherWidget,
});
