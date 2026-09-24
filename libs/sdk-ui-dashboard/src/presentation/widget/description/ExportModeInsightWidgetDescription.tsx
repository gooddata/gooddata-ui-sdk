// (C) 2025-2026 GoodData Corporation

import { DescriptionPanelContent } from "@gooddata/sdk-ui-kit";

import { useRichTextWidgetInputs } from "../../../_staging/sharedHooks/useRichTextInputs.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { useInsightWidgetDescription } from "./useInsightWidgetDescription.js";

/**
 * Simplified version of the InsightWidgetDescriptionTrigger component that is used in export mode.
 *
 * It is hidden, but holds the export data and content for exporter.
 */
export function ExportModeInsightWidgetDescription(props: IInsightWidgetDescriptionTriggerProps) {
    const { exportData, widget, insight } = props;
    const { isVisible, description } = useInsightWidgetDescription(props);
    const richTextInputs = useRichTextWidgetInputs(widget, description ?? "", insight);
    const { LoadingComponent } = useDashboardComponentsContext();

    if (!isVisible) {
        return null;
    }

    return (
        <div style={{ display: "none" }} {...exportData}>
            <DescriptionPanelContent
                description={description}
                useReferences
                {...richTextInputs}
                LoadingComponent={LoadingComponent}
            />
        </div>
    );
}
