// (C) 2024 GoodData Corporation

import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardLayout } from "../../dashboardLayout/DefaultDashboardLayout.js";
import { EditableDashboardNestedLayoutWidget } from "./EditableDashboardNestedLayoutWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardNestedLayoutWidget = renderModeAware({
    view: DefaultDashboardLayout,
    edit: EditableDashboardNestedLayoutWidget,
});
