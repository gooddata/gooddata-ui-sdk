// (C) 2025 GoodData Corporation

import { DescriptionPanelContent } from "@gooddata/sdk-ui-kit";

import {
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectSeparators,
    useDashboardSelector,
} from "../../../model/index.js";
import { useRichTextFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";

/**
 * Simplified version of the InsightWidgetDescriptionTrigger component that is used in export mode.
 *
 * It is hidden, but holds the export data and content for exporter.
 */
export function ExportModeInsightWidgetDescription(props: IInsightWidgetDescriptionTriggerProps) {
    const { exportData, widget } = props;
    const { isVisible, description, useRichText } = useInsightWidgetDescription(props);
    const useReferences = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { filters } = useRichTextFilters(widget);
    const separators = useDashboardSelector(selectSeparators);
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const { LoadingComponent } = useDashboardComponentsContext();

    if (!isVisible) {
        return null;
    }

    return (
        <div style={{ display: "none" }} {...exportData}>
            <DescriptionPanelContent
                description={description}
                useRichText={useRichText}
                useReferences={useReferences}
                filters={filters}
                separators={separators}
                LoadingComponent={LoadingComponent}
                execConfig={{
                    timestamp: executionTimestamp,
                }}
            />
        </div>
    );
}
