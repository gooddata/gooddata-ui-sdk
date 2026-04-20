// (C) 2025-2026 GoodData Corporation

import { ExportModeInsightWidgetDescription } from "../../description/ExportModeInsightWidgetDescription.js";
import { InsightWidgetDescriptionComponentProvider } from "../../description/InsightWidgetDescriptionComponentProvider.js";
import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget.js";
import { type IDefaultDashboardInsightWidgetProps } from "./types.js";

/**
 * Insight widget that can be exported.
 *
 * This component wraps the DefaultDashboardInsightWidget with the ExportModeInsightWidgetDescription
 * to provide the description component that is not publicly customizable for exporter.
 */
export function ExportableDashboardInsightWidget(props: IDefaultDashboardInsightWidgetProps) {
    return (
        <InsightWidgetDescriptionComponentProvider
            InsightWidgetDescriptionComponent={ExportModeInsightWidgetDescription}
        >
            <DefaultDashboardInsightWidget {...props} />
        </InsightWidgetDescriptionComponentProvider>
    );
}
