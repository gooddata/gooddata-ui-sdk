// (C) 2025 GoodData Corporation

import React from "react";
import { DescriptionPanelContent } from "@gooddata/sdk-ui-kit";
import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";

/**
 * Simplified version of the InsightWidgetDescriptionTrigger component that is used in export mode.
 *
 * It is hidden, but holds the export data and content for exporter.
 */
export const ExportModeInsightWidgetDescription: React.FC<IInsightWidgetDescriptionTriggerProps> = (
    props,
) => {
    const { exportData } = props;
    const { isVisible, description, useRichText } = useInsightWidgetDescription(props);

    if (!isVisible) {
        return null;
    }

    return (
        <div style={{ display: "none" }} {...exportData}>
            <DescriptionPanelContent description={description} useRichText={useRichText} />
        </div>
    );
};
