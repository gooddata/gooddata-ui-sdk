// (C) 2022-2026 GoodData Corporation

import { renderModeAware } from "../../../componentDefinition/renderModeAware.js";

import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget.js";
import { EditableDashboardInsightWidget } from "./EditableDashboardInsightWidget.js";
import { ExportableDashboardInsightWidget } from "./ExportableDashboardInsightWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardInsightWidget = renderModeAware({
    view: DefaultDashboardInsightWidget,
    edit: EditableDashboardInsightWidget,
    export: ExportableDashboardInsightWidget,
});
