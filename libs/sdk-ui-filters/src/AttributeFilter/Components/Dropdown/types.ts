// (C) 2022 GoodData Corporation

/**
 * AttributeFilter dropdown content that is displayed in the open state of AttributeFilter.
 *
 * @beta
 */
export interface IAttributeFilterDropdownBodyProps {
    /**
     * Callback that will be called each time ApplyButton clicked.
     *
     * @beta
     */
    onApplyButtonClick: () => void;

    /**
     * Callback that will be called each time CancelButton clicked.
     *
     * @beta
     */
    onCancelButtonClick: () => void;

    /**
     * Specify the width of dropdown body.
     *
     * @beta
     */
    width?: number;
}
