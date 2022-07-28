// (C) 2022 GoodData Corporation
import { renderModeAware } from "../../componentDefinition";

import { DefaultDashboardInsight } from "./DefaultDashboardInsight";
import { EditableDashboardInsight } from "./EditableDashboardInsight";

/**
 * @internal
 */
export const RenderModeAwareDashboardInsight = renderModeAware({
    view: DefaultDashboardInsight,
    edit: EditableDashboardInsight,
});
