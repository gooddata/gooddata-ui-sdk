// (C) 2019-2024 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { RichText } from "@gooddata/sdk-ui-kit";
import { selectEnableRichTextDescriptions, useDashboardSelector } from "../../../model/index.js";

/**
 * @alpha
 */
export interface IDashboardLayoutSectionHeaderDescriptionProps {
    description: string;
}

export const DashboardLayoutSectionHeaderDescription: React.FC<
    IDashboardLayoutSectionHeaderDescriptionProps
> = (props) => {
    const { description } = props;
    const useRichText = useDashboardSelector(selectEnableRichTextDescriptions);

    const className = cx("gd-paragraph", "description", "s-fluid-layout-row-description");
    return (
        <div className={className}>
            {useRichText ? (
                <RichText
                    className="gd-layout-row-description-richtext"
                    value={description}
                    renderMode="view"
                />
            ) : (
                description
            )}
        </div>
    );
};
