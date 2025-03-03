// (C) 2022-2025 GoodData Corporation
import React from "react";
import { renderModeAware } from "../../componentDefinition/index.js";
import { useBackendWithInsightWidgetCorrelation } from "./useBackendWithInsightWidgetCorrelation.js";
import { ViewModeDashboardInsight } from "./ViewModeDashboardInsight/index.js";
import { EditModeDashboardInsight } from "./EditModeDashboardInsight/index.js";
import { ExportModeDashboardInsight } from "./ExportModeDashboardInsight/index.js";
import { IDashboardInsightProps } from "./types.js";

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
export const DefaultDashboardInsight = (props: IDashboardInsightProps) => {
    const backend = useBackendWithInsightWidgetCorrelation(props);

    return <DefaultDashboardInsightInner {...props} backend={backend} />;
};
