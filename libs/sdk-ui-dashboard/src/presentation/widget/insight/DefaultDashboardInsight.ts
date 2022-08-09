// (C) 2022 GoodData Corporation
import { renderModeAware } from "../../componentDefinition";

import { ViewModeDashboardInsight } from "./ViewModeDashboardInsight";
import { EditModeDashboardInsight } from "./EditModeDashboardInsight";

/**
 * Default implementation of the Dashboard Insight widget.
 *
 * @public
 */
export const DefaultDashboardInsight = renderModeAware({
    view: ViewModeDashboardInsight,
    edit: EditModeDashboardInsight,
});
