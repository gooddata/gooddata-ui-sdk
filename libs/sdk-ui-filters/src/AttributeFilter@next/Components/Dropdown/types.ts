// (C) 2022 GoodData Corporation

/**
 * @alpha
 */
export interface IAttributeFilterDropdownBodyProps {
    onApplyButtonClick: () => void;
    onCloseButtonClick: () => void;
}

/**
 * @alpha
 */
export interface IAttributeFilterDropdownContentProps {
    error?: any;
    hasNoMatchingData: boolean;
    hasNoData: boolean;
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
}
