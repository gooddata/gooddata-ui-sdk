// (C) 2022-2025 GoodData Corporation
import { renderModeAware } from "../../componentDefinition/index.js";

import { ViewModeDashboardInsight } from "./ViewModeDashboardInsight/index.js";
import { EditModeDashboardInsight } from "./EditModeDashboardInsight/index.js";
import { ExportModeDashboardInsight } from "./ExportModeDashboardInsight/index.js";

/**
 * Default implementation of the Dashboard Insight widget.
 *
 * @public
 */
export const DefaultDashboardInsight = renderModeAware({
    view: ViewModeDashboardInsight,
    edit: EditModeDashboardInsight,
    export: ExportModeDashboardInsight,
});
