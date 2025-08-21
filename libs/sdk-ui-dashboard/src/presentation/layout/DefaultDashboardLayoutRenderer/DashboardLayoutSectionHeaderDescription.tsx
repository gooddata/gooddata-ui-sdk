// (C) 2019-2025 GoodData Corporation
import * as React from "react";

import cx from "classnames";

import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { RichText } from "@gooddata/sdk-ui-kit";

import { useRichTextFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import {
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
    selectExecutionTimestamp,
    selectSeparators,
    useDashboardSelector,
} from "../../../model/index.js";
import { DescriptionExportData } from "../../export/index.js";

/**
 * @alpha
 */
export interface IDashboardLayoutSectionHeaderDescriptionProps {
    description: string;
    exportData?: DescriptionExportData;
    LoadingComponent?: React.ComponentType;
    onLoadingChanged?: OnLoadingChanged;
    onError?: OnError;
}

export function DashboardLayoutSectionHeaderDescription(
    props: IDashboardLayoutSectionHeaderDescriptionProps,
) {
    const { description, exportData, LoadingComponent, onLoadingChanged, onError } = props;
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { filters, loading } = useRichTextFilters(false);
    const separators = useDashboardSelector(selectSeparators);
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);

    const className = cx("gd-paragraph", "description", "s-fluid-layout-row-description");
    return (
        <div className={className} {...exportData?.description}>
            {useRichText ? (
                <RichText
                    className="gd-layout-row-description-richtext"
                    value={description}
                    renderMode="view"
                    rawContent={{
                        show: !!exportData?.richText,
                        dataAttributes: exportData?.richText?.markdown,
                    }}
                    execConfig={{
                        timestamp: executionTimestamp,
                    }}
                    referencesEnabled={isRichTextReferencesEnabled}
                    filters={filters}
                    isFiltersLoading={loading}
                    separators={separators}
                    LoadingComponent={LoadingComponent}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                />
            ) : (
                description
            )}
        </div>
    );
}
