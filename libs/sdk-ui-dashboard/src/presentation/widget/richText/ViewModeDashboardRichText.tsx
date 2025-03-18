// (C) 2020-2025 GoodData Corporation
import React from "react";
import { RichText } from "@gooddata/sdk-ui-kit";

import { selectEnableRichTextDynamicReferences, useDashboardSelector } from "../../../model/index.js";
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
    const filters = useRichTextFilters(widget);
    const { LoadingComponent } = useDashboardComponentsContext();

    return (
        <RichText
            referencesEnabled={isRichTextReferencesEnabled}
            className="gd-rich-text-widget"
            value={widget?.content}
            filters={filters}
            renderMode="view"
            rawContent={{
                show: !!richTextExportData,
                dataAttributes: richTextExportData?.markdown,
            }}
            onLoadingChanged={onLoadingChanged}
            onError={onError}
            LoadingComponent={LoadingComponent}
        />
    );
};
