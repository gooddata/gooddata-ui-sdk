// (C) 2021-2022 GoodData Corporation
import React from "react";
import { InvertableSelectAllCheckbox } from "@gooddata/sdk-ui-kit";

/**
 * It represents a component that allows users add/remove/toggle to/from selection elements that respect current search criteria.
 *
 * @beta
 */
export interface IAttributeFilterElementsActionsProps {
    /**
     * Indicate that all items that respect current search criteria are selected or not.
     * @beta
     */
    checked: boolean;

    /**
     * Callback to select or unselect items that respect current search criteria.
     * @beta
     */
    onChange: (value: boolean) => void;

    /**
     * Toggle items that respect current search criteria
     * @beta
     */
    onToggle: () => void;

    /**
     * Indicate that items are filtered or not by parent filters.
     * @beta
     */
    isFiltered: boolean;

    /**
     * Number of elements that respect current search criteria
     * @beta
     */
    totalItemsCount: number;

    /**
     * Indicate that elements that respect current search criteria are partially selected
     * @beta
     */
    isPartialSelection: boolean;

    /**
     * Indicate that component is visible or not
     * @beta
     */
    isVisible: boolean;
}

/**
 * It displays three state a checkbox and allow select all or none elements that respect current search criteria.
 * It also displays a number of elements that respect current search criteria.
 *
 * @beta
 */
export const AttributeFilterElementsActions: React.VFC<IAttributeFilterElementsActionsProps> = (props) => {
    const { checked, isVisible, onChange, onToggle, isFiltered, totalItemsCount, isPartialSelection } = props;

    return (
        <InvertableSelectAllCheckbox
            isVisible={isVisible}
            checked={checked}
            onChange={onChange}
            onToggle={onToggle}
            isFiltered={isFiltered}
            totalItemsCount={totalItemsCount}
            isPartialSelection={isPartialSelection}
        />
    );
};
