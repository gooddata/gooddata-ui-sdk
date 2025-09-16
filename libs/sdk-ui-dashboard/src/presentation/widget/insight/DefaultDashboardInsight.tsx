// (C) 2022-2025 GoodData Corporation

import { EditModeDashboardInsight } from "./EditModeDashboardInsight/index.js";
import { ExportModeDashboardInsight } from "./ExportModeDashboardInsight/index.js";
import { IDashboardInsightProps } from "./types.js";
import { useBackendWithInsightWidgetCorrelation } from "./useBackendWithInsightWidgetCorrelation.js";
import { ViewModeDashboardInsight } from "./ViewModeDashboardInsight/index.js";
import { renderModeAware } from "../../componentDefinition/index.js";

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
