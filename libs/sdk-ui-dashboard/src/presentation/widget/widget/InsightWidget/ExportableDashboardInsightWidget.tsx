// (C) 2025 GoodData Corporation
import React from "react";

import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget.js";
import { IDefaultDashboardInsightWidgetProps } from "./types.js";
import { ExportModeInsightWidgetDescription } from "../../description/ExportModeInsightWidgetDescription.js";
import { InsightWidgetDescriptionComponentProvider } from "../../description/InsightWidgetDescriptionComponentProvider.js";

/**
 * Insight widget that can be exported.
 *
 * This component wraps the DefaultDashboardInsightWidget with the ExportModeInsightWidgetDescription
 * to provide the description component that is not publicly customizable for exporter.
 */
export const ExportableDashboardInsightWidget: React.FC<IDefaultDashboardInsightWidgetProps> = (props) => {
    return (
        <InsightWidgetDescriptionComponentProvider
            InsightWidgetDescriptionComponent={ExportModeInsightWidgetDescription}
        >
            <DefaultDashboardInsightWidget {...props} />
        </InsightWidgetDescriptionComponentProvider>
    );
};
