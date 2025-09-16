// (C) 2021-2025 GoodData Corporation

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

    /**
     * @beta
     */
    isApplyDisabled?: boolean;

    /**
     * @beta
     */
    onApplyButtonClick?: () => void;
}

/**
 * It displays three state a checkbox and allow select all or none elements that respect current search criteria.
 * It also displays a number of elements that respect current search criteria.
 *
 * @beta
 */
export function AttributeFilterElementsActions(props: IAttributeFilterElementsActionsProps) {
    return <InvertableSelectAllCheckbox {...props} />;
}
