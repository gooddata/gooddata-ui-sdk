// (C) 2019-2026 GoodData Corporation

import { type ComponentType } from "react";

import cx from "classnames";

import { type OnError, type OnLoadingChanged } from "@gooddata/sdk-ui";
import { RichText } from "@gooddata/sdk-ui-kit";

import { useSectionDescriptionFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
    selectSeparators,
} from "../../../model/store/config/configSelectors.js";
import { selectExecutionTimestamp } from "../../../model/store/ui/uiSelectors.js";
import { type DescriptionExportData } from "../../export/types.js";

/**
 * @alpha
 */
export interface IDashboardLayoutSectionHeaderDescriptionProps {
    description: string;
    exportData?: DescriptionExportData;
    LoadingComponent?: ComponentType;
    onLoadingChanged?: OnLoadingChanged;
    onError?: OnError;
}

export function DashboardLayoutSectionHeaderDescription({
    description,
    exportData,
    LoadingComponent,
    onLoadingChanged,
    onError,
}: IDashboardLayoutSectionHeaderDescriptionProps) {
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const { loading, filters } = useSectionDescriptionFilters();
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
