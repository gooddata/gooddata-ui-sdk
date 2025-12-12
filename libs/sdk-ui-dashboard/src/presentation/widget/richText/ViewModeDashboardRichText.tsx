// (C) 2020-2025 GoodData Corporation

import { RichText } from "@gooddata/sdk-ui-kit";

import { type IDashboardRichTextProps } from "./types.js";
import { useRichTextWidgetFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import {
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectSeparators,
    useDashboardSelector,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export function ViewModeDashboardRichText({
    widget,
    richTextExportData,
    onLoadingChanged,
    onError,
}: IDashboardRichTextProps) {
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { filters } = useRichTextWidgetFilters(widget);
    const separators = useDashboardSelector(selectSeparators);
    const { LoadingComponent } = useDashboardComponentsContext();

    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    return (
        <RichText
            referencesEnabled={isRichTextReferencesEnabled}
            className="gd-rich-text-widget"
            value={widget?.content}
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
