// (C) 2022 GoodData Corporation

import { DefaultDashboardKpi } from "./DefaultDashboardKpi";
import { EditableDashboardKpi } from "./EditableDashboardKpi";
import { renderModeAware } from "../../componentDefinition";

/**
 * @internal
 */
export const RenderModeAwareDashboardKpi = renderModeAware({
    view: DefaultDashboardKpi,
    edit: EditableDashboardKpi,
});
