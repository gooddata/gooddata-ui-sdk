// (C) 2023-2025 GoodData Corporation

import { AttributeFilterFilteredStatus } from "./AttributeFilterFilteredStatus.js";
import { AttributeFilterIrrelevantSelectionStatus } from "./AttributeFilterIrrelevantSelectionStatus.js";
import { AttributeFilterShowFilteredElements } from "./AttributeFilterShowFilteredElements.js";
import type { IAttributeFilterStatusBarProps } from "./types.js";

/**
 * A component that displays only effective parent filters.
 * Current selection is not rendered as it is too simple for single selection filter.
 *
 * @beta
 */
export function SingleSelectionAttributeFilterStatusBar(props: IAttributeFilterStatusBarProps) {
    const {
        enableShowingFilteredElements,
        isFilteredByParentFilters,
        parentFilterTitles,
        totalElementsCountWithCurrentSettings,
        attributeTitle,
        onShowFilteredElements,
        irrelevantSelection,
        isFilteredByLimitingValidationItems,
        isFilteredByDependentDateFilters,
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
}
