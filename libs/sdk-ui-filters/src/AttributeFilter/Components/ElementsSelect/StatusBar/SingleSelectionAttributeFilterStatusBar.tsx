// (C) 2023-2024 GoodData Corporation
import React from "react";
import { IAttributeFilterStatusBarProps } from "./AttributeFilterStatusBar.js";
import { AttributeFilterFilteredStatus } from "./AttributeFilterFilteredStatus.js";
import { AttributeFilterIrrelevantSelectionStatus } from "./AttributeFilterIrrelevantSelectionStatus.js";
import { AttributeFilterShowFilteredElements } from "./AttributeFilterShowFilteredElements.js";

/**
 * A component that displays only effective parent filters.
 * Current selection is not rendered as it is too simple for single selection filter.
 *
 * @beta
 */
export const SingleSelectionAttributeFilterStatusBar: React.FC<IAttributeFilterStatusBarProps> = (props) => {
    const {
        enableShowingFilteredElements,
        isFilteredByParentFilters,
        parentFilterTitles,
        totalElementsCountWithCurrentSettings,
        attributeTitle,
        onShowFilteredElements,
        irrelevantSelection,
        isFilteredByLimitingValidationItems,
    } = props;

    if (enableShowingFilteredElements) {
        return (
            <div className="gd-attribute-filter-status-bar__next">
                {isFilteredByParentFilters || isFilteredByLimitingValidationItems ? (
                    <AttributeFilterShowFilteredElements
                        attributeTitle={attributeTitle}
                        onClick={onShowFilteredElements}
                        parentFilterTitles={parentFilterTitles}
                        className="no-divider"
                        isFilteredByLimitingValidationItems={isFilteredByLimitingValidationItems}
                    />
                ) : null}
                <AttributeFilterIrrelevantSelectionStatus
                    parentFilterTitles={parentFilterTitles}
                    irrelevantSelection={irrelevantSelection}
                    showClearButton={false}
                />
            </div>
        );
    }

    return (
        <div className="gd-attribute-filter-status-bar__next">
            {isFilteredByParentFilters && totalElementsCountWithCurrentSettings > 0 ? (
                <AttributeFilterFilteredStatus parentFilterTitles={parentFilterTitles} />
            ) : null}
        </div>
    );
};
