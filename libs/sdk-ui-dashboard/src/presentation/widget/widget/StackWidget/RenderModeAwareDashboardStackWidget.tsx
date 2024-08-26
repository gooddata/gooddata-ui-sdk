// (C) 2024 GoodData Corporation
import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardStackWidget } from "./DefaultDashboardStackWidget.js";
import { EditableDashboardStackWidget } from "./EditableDashboardStackWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardStackWidget = renderModeAware({
    view: DefaultDashboardStackWidget,
    edit: EditableDashboardStackWidget,
});
