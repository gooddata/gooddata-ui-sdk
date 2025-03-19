// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { RichText } from "@gooddata/sdk-ui-kit";

import { useRichTextFilters } from "../../../_staging/sharedHooks/useRichTextFilters.js";
import {
    selectEnableRichTextDescriptions,
    selectEnableRichTextDynamicReferences,
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
}

export const DashboardLayoutSectionHeaderDescription: React.FC<
    IDashboardLayoutSectionHeaderDescriptionProps
> = (props) => {
    const { description, exportData, LoadingComponent } = props;
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);
    const isRichTextReferencesEnabled = useDashboardSelector(selectEnableRichTextDynamicReferences);
    const filters = useRichTextFilters();

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
                    referencesEnabled={isRichTextReferencesEnabled}
                    filters={filters}
                    LoadingComponent={LoadingComponent}
                />
            ) : (
                description
            )}
        </div>
    );
};
