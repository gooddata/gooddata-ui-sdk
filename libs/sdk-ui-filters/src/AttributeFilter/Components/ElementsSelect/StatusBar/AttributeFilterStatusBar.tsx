// (C) 2021-2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import React from "react";
import { AttributeFilterFilteredStatus } from "./AttributeFilterFilteredStatus";
import { AttributeFilterSelectionStatus } from "./AttributeFilterSelectionStatus";

/**
 * @alpha
 */
export interface IAttributeFilterStatusBarProps {
    totalElementsCountWithCurrentSettings: number;
    isFilteredByParentFilters: boolean;
    parentFilterTitles: string[];
    isInverted: boolean;
    selectedItems: IAttributeElement[];
    getItemTitle: (item: IAttributeElement) => string;
    selectedItemsLimit: number;
}

/**
 * @internal
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
            {isFilteredByParentFilters && totalElementsCountWithCurrentSettings > 0 && (
                <AttributeFilterFilteredStatus parentFilterTitles={parentFilterTitles} />
            )}
        </div>
    );
};
