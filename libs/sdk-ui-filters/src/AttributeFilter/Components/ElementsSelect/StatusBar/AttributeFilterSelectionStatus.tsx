// (C) 2021-2025 GoodData Corporation

import { type IAttributeElement } from "@gooddata/sdk-model";
import { InvertableSelectStatusBar } from "@gooddata/sdk-ui-kit";

/**
 * It represents a selection status component.
 *
 * @beta
 */
export interface IAttributeFilterSelectionStatusProps {
    /**
     * This prop means that current Attribute Filter is inverted or not.
     */
    isInverted: boolean;

    /**
     * List of selected elements
     */
    selectedItems: IAttributeElement[];

    /**
     * Item title getter it will return localized title for empty elements.
     */
    getItemTitle: (item: IAttributeElement) => string;

    /**
     * Maximum elements in selection.
     */
    selectedItemsLimit: number;

    /**
     * Display selection status.
     */
    showSelectionStatus?: boolean;
}

/**
 * A component that displays status of current selection, like number of selected elements, if Attribute Filter is inverted and list of selected elements.
 * @beta
 */
export function AttributeFilterSelectionStatus({
    isInverted,
    selectedItems,
    getItemTitle,
    selectedItemsLimit,
    showSelectionStatus,
}: IAttributeFilterSelectionStatusProps) {
    return (
        <InvertableSelectStatusBar
            className="gd-attribute-filter-selection-status__next"
            isInverted={isInverted}
            getItemTitle={getItemTitle}
            selectedItems={selectedItems}
            selectedItemsLimit={selectedItemsLimit}
            showSelectionStatus={showSelectionStatus}
        />
    );
}
