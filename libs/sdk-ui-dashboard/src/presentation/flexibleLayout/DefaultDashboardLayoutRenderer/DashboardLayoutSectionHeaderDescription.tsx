// (C) 2019-2026 GoodData Corporation

import { type ComponentType } from "react";

import cx from "classnames";

import { type OnError, type OnLoadingChanged } from "@gooddata/sdk-ui";
import { RichText } from "@gooddata/sdk-ui-kit";

import { useSectionDescriptionInputs } from "../../../_staging/sharedHooks/useRichTextInputs.js";
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
    const richTextInputs = useSectionDescriptionInputs(description);

    const className = cx("gd-paragraph", "description", "s-fluid-layout-row-description");
    return (
        <div className={className} {...exportData?.description}>
            <RichText
                className="gd-layout-row-description-richtext"
                value={description}
                renderMode="view"
                rawContent={{
                    show: !!exportData?.richText,
                    dataAttributes: exportData?.richText?.markdown,
                }}
                referencesEnabled
                {...richTextInputs}
                LoadingComponent={LoadingComponent}
                onLoadingChanged={onLoadingChanged}
                onError={onError}
            />
        </div>
    );
}
