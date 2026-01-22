// (C) 2022-2026 GoodData Corporation

import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget.js";
import { EditableDashboardInsightWidget } from "./EditableDashboardInsightWidget.js";
import { ExportableDashboardInsightWidget } from "./ExportableDashboardInsightWidget.js";
import { renderModeAware } from "../../../componentDefinition/renderModeAware.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardInsightWidget = renderModeAware({
    view: DefaultDashboardInsightWidget,
    edit: EditableDashboardInsightWidget,
    export: ExportableDashboardInsightWidget,
});
