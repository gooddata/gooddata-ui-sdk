// (C) 2022-2025 GoodData Corporation

import { RefObject } from "react";

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
    totalItemsCount: number | undefined;

    /**
     * Number of all elements that respect current search criteria.
     *
     * @beta
     */
    totalItemsCountWithCurrentSettings: number | undefined;

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

    /**
     * This enables "show filtered elements" option which manages showing filtered elements.
     */
    enableShowingFilteredElements?: boolean;

    /**
     * Indicate that elements are filtered by dependent date filters
     *
     * @beta
     */
    isFilteredByDependentDateFilters?: boolean;

    /**
     * Indicate that elements are filtered by limiting validation items
     *
     * @beta
     * @remarks Use only when platform supports limiting validation items.
     */
    isFilteredByLimitingValidationItems?: boolean;

    /**
     * Title of the attribute
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

    /**
     * Whether the filter is rendered without apply button.
     *
     * @remarks Usually true (in case of dashboard) when filtersApplyMode.mode === "ALL_AT_ONCE"
     */
    withoutApply?: boolean;

    /**
     * @beta
     */
    onApplyButtonClick?: () => void;

    /**
     * @beta
     */
    isApplyDisabled?: boolean;
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

    /**
     * Shown as fullscreen on mobile
     *
     * @beta
     */
    fullscreenOnMobile?: boolean;

    /**
     * Title of attribute's primary label
     *
     * @beta
     */
    primaryLabelTitle?: string;

    /**
     * Indicates which element of the list item is focused by keyboard.
     *
     * @beta
     */
    focusedAction?: string;

    /**
     * The ref for the parent list element. Used for focus management.
     *
     * @beta
     */
    listRef?: RefObject<HTMLElement>;

    /**
     * The index of the item in the list. Used for accessibility purposes.
     *
     * @beta
     */
    index?: number;

    /**
     * The number of items in the list. Used for accessibility purposes.
     *
     * @beta
     */
    itemsCount?: number;
}
