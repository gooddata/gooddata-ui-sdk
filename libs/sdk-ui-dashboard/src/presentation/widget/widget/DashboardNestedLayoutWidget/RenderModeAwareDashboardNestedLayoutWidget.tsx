// (C) 2024-2025 GoodData Corporation

import { EditableDashboardNestedLayoutWidget } from "./EditableDashboardNestedLayoutWidget.js";
import { renderModeAware } from "../../../componentDefinition/index.js";
import { DefaultDashboardLayout } from "../../dashboardLayout/DefaultDashboardLayout.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardNestedLayoutWidget = renderModeAware({
    view: DefaultDashboardLayout,
    edit: EditableDashboardNestedLayoutWidget,
});
