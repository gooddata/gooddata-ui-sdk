// (C) 2022 GoodData Corporation

import { ViewModeDashboardKpi } from "./ViewModeDashboardKpi/index.js";
import { EditModeDashboardKpi } from "./EditModeDashboardKpi/index.js";
import { renderModeAware } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const DefaultDashboardKpi = renderModeAware({
    view: ViewModeDashboardKpi,
    edit: EditModeDashboardKpi,
});
