// (C) 2023 GoodData Corporation
import React from "react";
import { IAttributeFilterStatusBarProps } from "./AttributeFilterStatusBar.js";
import { AttributeFilterFilteredStatus } from "./AttributeFilterFilteredStatus.js";

/**
 * A component that displays only effective parent filters.
 * Current selection is not rendered as it is too simple for single selection filter.
 *
 * @beta
 */
export const SingleSelectionAttributeFilterStatusBar: React.FC<IAttributeFilterStatusBarProps> = (props) => {
    const { isFilteredByParentFilters, parentFilterTitles, totalElementsCountWithCurrentSettings } = props;

    return (
        <div className="gd-attribute-filter-status-bar__next">
            {isFilteredByParentFilters && totalElementsCountWithCurrentSettings > 0 ? (
                <AttributeFilterFilteredStatus parentFilterTitles={parentFilterTitles} />
            ) : null}
        </div>
    );
};
