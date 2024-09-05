// (C) 2024 GoodData Corporation

import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardVisualizationSwitcherWidget } from "./DefaultDashboardVisualizationSwitcherWidget.js";
import { EditableDashboardVisualizationSwitcherWidget } from "./EditableDashboardVisualizationSwitcherWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardVisualizationSwitchertWidget = renderModeAware({
    view: DefaultDashboardVisualizationSwitcherWidget,
    edit: EditableDashboardVisualizationSwitcherWidget,
});
