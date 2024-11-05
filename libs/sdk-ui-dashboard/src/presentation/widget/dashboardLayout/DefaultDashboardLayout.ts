// (C) 2024 GoodData Corporation

import { DashboardLayout } from "./DashboardLayout.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * Default implementation of the dashboard layout widget.
 *
 * @public
 */
export const DefaultDashboardLayout = renderModeAware({
    view: DashboardLayout,
    edit: DashboardLayout,
});
