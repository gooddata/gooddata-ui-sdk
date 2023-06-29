// (C) 2022 GoodData Corporation
import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget.js";
import { EditableDashboardInsightWidget } from "./EditableDashboardInsightWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardInsightWidget = renderModeAware({
    view: DefaultDashboardInsightWidget,
    edit: EditableDashboardInsightWidget,
});
