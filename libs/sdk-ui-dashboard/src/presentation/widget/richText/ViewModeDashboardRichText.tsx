// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { RichText } from "@gooddata/sdk-ui-kit";

import { type IDashboardRichTextProps } from "./types.js";
import { useRichTextWidgetFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectEnableRichTextDynamicReferences,
    selectSeparators,
} from "../../../model/store/config/configSelectors.js";
import { DASHBOARD_SUMMARY_MACRO } from "../../../model/store/dashboardSummaryWorkflow/constants.js";
import { selectCurrentDashboardSummaryWorkflowStatus } from "../../../model/store/dashboardSummaryWorkflow/dashboardSummaryWorkflowSelectors.js";
import { selectCurrentDashboardSummary } from "../../../model/store/listedDashboards/listedDashboardsSummarySelectors.js";
import { selectExecutionTimestamp } from "../../../model/store/ui/uiSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function ViewModeDashboardRichText({
    widget,
    richTextExportData,
    onLoadingChanged,
    onError,
}: IDashboardRichTextProps) {
    const intl = useIntl();
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { filters } = useRichTextWidgetFilters(widget);
    const separators = useDashboardSelector(selectSeparators);
    const { LoadingComponent } = useDashboardComponentsContext();
    const dashboardSummary = useDashboardSelector(selectCurrentDashboardSummary);
    const summaryWorkflowStatus = useDashboardSelector(selectCurrentDashboardSummaryWorkflowStatus);

    const summaryWorkflowReplaceString = (() => {
        switch (summaryWorkflowStatus) {
            case "FAILED":
            case "CANCELLED":
                return intl.formatMessage({ id: "richText.summaryDashboard.failed" });
            case "RUNNING":
            case "AWAITING_REFRESH":
                return intl.formatMessage({ id: "richText.summaryDashboard.generating.shortly" });
            case "COMPLETED": {
                const trimmedSummary = dashboardSummary?.trim();
                return trimmedSummary || intl.formatMessage({ id: "richText.summaryDashboard.empty" });
            }
            default: {
                const trimmedSummary = dashboardSummary?.trim();
                return (
                    trimmedSummary ||
                    intl.formatMessage({
                        id: "richText.summaryDashboard.generating.reload",
                    })
                );
            }
        }
    })();

    const raw = widget?.content ?? "";
    const value = raw.split(DASHBOARD_SUMMARY_MACRO).join(summaryWorkflowReplaceString);
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    return (
        <RichText
            referencesEnabled={isRichTextReferencesEnabled}
            className="gd-rich-text-widget"
            value={value}
            filters={filters}
            separators={separators}
            renderMode="view"
            rawContent={{
                show: !!richTextExportData,
                dataAttributes: richTextExportData?.markdown,
            }}
            execConfig={{
                timestamp: executionTimestamp,
            }}
            onLoadingChanged={onLoadingChanged}
            onError={onError}
            LoadingComponent={LoadingComponent}
        />
    );
}
