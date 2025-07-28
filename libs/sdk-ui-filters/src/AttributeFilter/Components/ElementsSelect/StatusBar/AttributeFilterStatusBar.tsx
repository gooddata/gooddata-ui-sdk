// (C) 2021-2025 GoodData Corporation
import React from "react";
import { AttributeFilterFilteredStatus } from "./AttributeFilterFilteredStatus.js";
import { AttributeFilterSelectionStatus } from "./AttributeFilterSelectionStatus.js";
import { AttributeFilterShowFilteredElements } from "./AttributeFilterShowFilteredElements.js";
import { AttributeFilterIrrelevantSelectionStatus } from "./AttributeFilterIrrelevantSelectionStatus.js";
import noop from "lodash/noop.js";
import type { IAttributeFilterStatusBarProps } from "./types.js";

/**
 * A component that displays status of current selection, like number of selected elements, if Attribute Filter is inverted and list of selected elements.
 *
 * @beta
 */
export const AttributeFilterStatusBar: React.FC<IAttributeFilterStatusBarProps> = (props) => {
    const {
        attributeTitle,
        isFilteredByParentFilters,
        parentFilterTitles,
        totalElementsCountWithCurrentSettings,
        getItemTitle,
        isInverted,
        selectedItems,
        selectedItemsLimit,
        enableShowingFilteredElements = false,
        onShowFilteredElements = noop,
        irrelevantSelection = [],
        onClearIrrelevantSelection = noop,
        isFilteredByLimitingValidationItems,
        isFilteredByDependentDateFilters,
        withoutApply = false,
    } = props;

    if (enableShowingFilteredElements) {
        return (
            <div className="gd-attribute-filter-status-bar__next">
                {isFilteredByParentFilters ||
                isFilteredByLimitingValidationItems ||
                isFilteredByDependentDateFilters ? (
                    <AttributeFilterShowFilteredElements
                        attributeTitle={attributeTitle}
                        onClick={onShowFilteredElements}
                        parentFilterTitles={parentFilterTitles}
                        isFilteredByLimitingValidationItems={isFilteredByLimitingValidationItems}
                    />
                ) : null}
                <AttributeFilterSelectionStatus
                    isInverted={isInverted}
                    getItemTitle={getItemTitle}
                    selectedItems={selectedItems}
                    selectedItemsLimit={selectedItemsLimit}
                />
                <AttributeFilterIrrelevantSelectionStatus
                    parentFilterTitles={parentFilterTitles}
                    irrelevantSelection={irrelevantSelection}
                    onClear={onClearIrrelevantSelection}
                />
            </div>
        );
    }

    return (
        <div className="gd-attribute-filter-status-bar__next">
            {!withoutApply ? (
                <AttributeFilterSelectionStatus
                    isInverted={isInverted}
                    getItemTitle={getItemTitle}
                    selectedItems={selectedItems}
                    selectedItemsLimit={selectedItemsLimit}
                />
            ) : null}
            {isFilteredByParentFilters && totalElementsCountWithCurrentSettings > 0 ? (
                <AttributeFilterFilteredStatus parentFilterTitles={parentFilterTitles} />
            ) : null}
        </div>
    );
};
