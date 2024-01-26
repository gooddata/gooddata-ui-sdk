// (C) 2021-2024 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import React from "react";
import { AttributeFilterFilteredStatus } from "./AttributeFilterFilteredStatus.js";
import { AttributeFilterSelectionStatus } from "./AttributeFilterSelectionStatus.js";
import { AttributeFilterShowFilteredElements } from "./AttributeFilterShowFilteredElements.js";
import { AttributeFilterIrrelevantSelectionStatus } from "./AttributeFilterIrrelevantSelectionStatus.js";
import noop from "lodash/noop.js";

/**
 * It represents component that display status of current selection.
 * @beta
 */
export interface IAttributeFilterStatusBarProps {
    /**
     * Number of elements that respect current criteria.
     */
    totalElementsCountWithCurrentSettings: number;

    /**
     * Indicate that elements are filtered by parents filters or not.
     */
    isFilteredByParentFilters: boolean;

    /**
     * Indicate if the elements are filtered by limit validation items or not.
     *
     * @beta
     * @remarks Use only when platform supports limiting validation items.
     */
    isFilteredByLimitingValidationItems?: boolean;

    /**
     * List of parent filter titles that filter current elements.
     *
     * @beta
     */
    parentFilterTitles: string[];

    /**
     * Indicate that current filter is inverted {@link @gooddata/sdk-model#INegativeAttributeFilter} or not {@link @gooddata/sdk-model#IPositiveAttributeFilter}
     *
     * @beta
     */
    isInverted: boolean;

    /**
     * List of selected items
     * @beta
     */
    selectedItems: IAttributeElement[];

    /**
     * Item title getter used to get translated item empty value
     *
     * @beta
     */
    getItemTitle: (item: IAttributeElement) => string;

    /**
     * Maximum selected items
     *
     * @beta
     */
    selectedItemsLimit: number;

    /**
     * This enables "show filtered elements" option which manages showing filtered elements.
     */
    enableShowingFilteredElements?: boolean;

    /**
     * Title of the attribute used for dependent filter configuration.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    attributeTitle?: string;

    /**
     * Show filtered elements callback.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    onShowFilteredElements?: () => void;

    /**
     * Irrelevant/filtered out selection elements which are still effective.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    irrelevantSelection?: IAttributeElement[];

    /**
     * Clear irrelevant/filtered out selection callback.
     *
     * @remarks Used only when showing filtered elements is enabled.
     */
    onClearIrrelevantSelection?: () => void;
}

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
    } = props;

    if (enableShowingFilteredElements) {
        return (
            <div className="gd-attribute-filter-status-bar__next">
                {isFilteredByParentFilters || isFilteredByLimitingValidationItems ? (
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
            <AttributeFilterSelectionStatus
                isInverted={isInverted}
                getItemTitle={getItemTitle}
                selectedItems={selectedItems}
                selectedItemsLimit={selectedItemsLimit}
            />
            {isFilteredByParentFilters && totalElementsCountWithCurrentSettings > 0 ? (
                <AttributeFilterFilteredStatus parentFilterTitles={parentFilterTitles} />
            ) : null}
        </div>
    );
};
