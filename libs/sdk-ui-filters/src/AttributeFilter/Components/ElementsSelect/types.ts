// (C) 2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * It represents a list of Attribute filter elements.
 * It allows users to search elements and display a number of elements that respect current search criteria.
 * It manipulates with current selection.
 * It allows paging.
 * It displays the current selection status.
 *
 * @beta
 */
export interface IAttributeFilterElementsSelectProps {
    /**
     * List of Attribute filter elements that are loaded and respect current search criteria.
     */
    items: IAttributeElement[];

    /**
     * Number of all elements that respect current search criteria.
     *
     * @beta
     */
    totalItemsCount: number;

    /**
     * Number of all elements that respect current search criteria.
     *
     * @beta
     */
    totalItemsCountWithCurrentSettings: number;

    /**
     * Indicate if current filter is inverted or not see: {@link @gooddata/sdk-model#IPositiveAttributeFilter} or  {@link @gooddata/sdk-model#INegativeAttributeFilter}
     *
     * @beta
     */
    isInverted: boolean;

    /**
     * List of current selected items.
     *
     * @beta
     */
    selectedItems: IAttributeElement[];

    /**
     * Change selection callback
     *
     * @beta
     */
    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;

    /**
     * Current search string
     *
     * @beta
     */
    searchString: string;

    /**
     * Search callback
     *
     * @beta
     */
    onSearch: (searchString: string) => void;

    /**
     * Indicator that AttributeFilter component is in loading state
     *
     * @beta
     */
    isLoading: boolean;

    /**
     * Indicator that next page of elements is loading or not
     *
     * @beta
     */
    isLoadingNextPage: boolean;

    /**
     * Callback to obtain next page of AttributeFilter elements
     *
     * @beta
     */
    onLoadNextPage: () => void;

    /**
     * Size of next page of elements
     *
     * @beta
     */
    nextPageSize: number;

    /**
     * List of parent filter titles that filter current elements
     *
     * @beta
     */
    parentFilterTitles: string[];

    /**
     * Indicate that elements are filtered by parent filters
     *
     * @beta
     */
    isFilteredByParentFilters: boolean;

    /**
     * Error
     *
     * @beta
     */
    error?: GoodDataSdkError;
}

/**
 * It represents an Attribute Filter item.
 * It displays element label, it allow user to add/remove element to/from selection.
 * It allows users to clear selection and add only it into selection.
 *
 * @beta
 */
export interface IAttributeFilterElementsSelectItemProps {
    /**
     * Item of list
     *
     * @beta
     */
    item: IAttributeElement;

    /**
     * Indicate that item is selected
     *
     * @beta
     */
    isSelected: boolean;

    /**
     * Add item to selection callback
     *
     * @beta
     */
    onSelect: () => void;

    /**
     * Remove item from selection
     *
     * @beta
     */
    onDeselect: () => void;

    /**
     * Select item only
     *
     * @beta
     */
    onSelectOnly: () => void;
}
