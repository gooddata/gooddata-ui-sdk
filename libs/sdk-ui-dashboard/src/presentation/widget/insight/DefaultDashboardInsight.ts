// (C) 2022 GoodData Corporation
import { renderModeAware } from "../../componentDefinition/index.js";

import { ViewModeDashboardInsight } from "./ViewModeDashboardInsight/index.js";
import { EditModeDashboardInsight } from "./EditModeDashboardInsight/index.js";

/**
 * Default implementation of the Dashboard Insight widget.
 *
 * @public
 */
export const DefaultDashboardInsight = renderModeAware({
    view: ViewModeDashboardInsight,
    edit: EditModeDashboardInsight,
});
