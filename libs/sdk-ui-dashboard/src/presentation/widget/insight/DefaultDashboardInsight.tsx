// (C) 2022-2026 GoodData Corporation

import { EditModeDashboardInsight } from "./EditModeDashboardInsight/EditModeDashboardInsight.js";
import { ExportModeDashboardInsight } from "./ExportModeDashboardInsight/ExportModeDashboardInsight.js";
import { type IDashboardInsightProps } from "./types.js";
import { useBackendWithInsightWidgetCorrelation } from "./useBackendWithInsightWidgetCorrelation.js";
import { ViewModeDashboardInsight } from "./ViewModeDashboardInsight/ViewModeDashboardInsight.js";
import { renderModeAware } from "../../componentDefinition/renderModeAware.js";

/**
 * @internal
 */
const DefaultDashboardInsightInner = renderModeAware({
    view: ViewModeDashboardInsight,
    edit: EditModeDashboardInsight,
    export: ExportModeDashboardInsight,
});

/**
 * Default implementation of the Dashboard Insight widget.
 *
 * @public
 */
export function DefaultDashboardInsight(props: IDashboardInsightProps) {
    const backend = useBackendWithInsightWidgetCorrelation(props);

    return <DefaultDashboardInsightInner {...props} backend={backend} />;
}
