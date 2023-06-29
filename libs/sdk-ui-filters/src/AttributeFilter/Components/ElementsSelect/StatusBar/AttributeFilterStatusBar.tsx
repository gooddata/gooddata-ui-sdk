// (C) 2021-2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import React from "react";
import { AttributeFilterFilteredStatus } from "./AttributeFilterFilteredStatus.js";
import { AttributeFilterSelectionStatus } from "./AttributeFilterSelectionStatus.js";

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
}

/**
 * A component that displays status of current selection, like number of selected elements, if Attribute Filter is inverted and list of selected elements.
 *
 * @beta
 */
export const AttributeFilterStatusBar: React.FC<IAttributeFilterStatusBarProps> = (props) => {
    const {
        isFilteredByParentFilters,
        parentFilterTitles,
        totalElementsCountWithCurrentSettings,
        getItemTitle,
        isInverted,
        selectedItems,
        selectedItemsLimit,
    } = props;

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
