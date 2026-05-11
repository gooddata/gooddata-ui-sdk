// (C) 2024-2026 GoodData Corporation

import { renderModeAware } from "../../../componentDefinition/renderModeAware.js";
import { DefaultDashboardLayout } from "../../dashboardLayout/DefaultDashboardLayout.js";

import { EditableDashboardNestedLayoutWidget } from "./EditableDashboardNestedLayoutWidget.js";

/**
 * @internal
 */
export const RenderModeAwareDashboardNestedLayoutWidget = renderModeAware({
    view: DefaultDashboardLayout,
    edit: EditableDashboardNestedLayoutWidget,
});
