// (C) 2024-2026 GoodData Corporation

import { renderModeAware } from "../../componentDefinition/renderModeAware.js";
import { DashboardLayout } from "./DashboardLayout.js";

/**
 * Default implementation of the dashboard layout widget.
 *
 * @public
 */
export const DefaultDashboardLayout = renderModeAware({
    view: DashboardLayout,
    edit: DashboardLayout,
});
