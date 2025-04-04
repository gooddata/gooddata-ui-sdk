// (C) 2020-2025 GoodData Corporation
import React from "react";
import { RichText } from "@gooddata/sdk-ui-kit";

import {
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectSeparators,
    useDashboardSelector,
} from "../../../model/index.js";
import { useRichTextFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

import { IDashboardRichTextProps } from "./types.js";

/**
 * @internal
 */
export const ViewModeDashboardRichText: React.FC<IDashboardRichTextProps> = ({
    widget,
    richTextExportData,
    onLoadingChanged,
    onError,
}) => {
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { filters } = useRichTextFilters(widget);
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
};
