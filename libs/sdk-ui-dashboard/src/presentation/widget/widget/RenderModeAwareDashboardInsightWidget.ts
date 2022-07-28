// (C) 2022 GoodData Corporation
import { renderModeAware } from "../../componentDefinition";
import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget";
import { EditableDashboardInsightWidget } from "./EditableDashboardInsightWidget";

/**
 * @internal
 */
export const RenderModeAwareDashboardInsightWidget = renderModeAware({
    view: DefaultDashboardInsightWidget,
    edit: EditableDashboardInsightWidget,
});
