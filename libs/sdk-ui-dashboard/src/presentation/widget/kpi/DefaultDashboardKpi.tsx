// (C) 2022 GoodData Corporation

import { ViewModeDashboardKpi } from "./ViewModeDashboardKpi";
import { EditModeDashboardKpi } from "./EditModeDashboardKpi";
import { renderModeAware } from "../../componentDefinition";

/**
 * @internal
 */
export const DefaultDashboardKpi = renderModeAware({
    view: ViewModeDashboardKpi,
    edit: EditModeDashboardKpi,
});
