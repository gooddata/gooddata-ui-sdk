// (C) 2021-2022 GoodData Corporation
import React from "react";
import { IAttributeElement } from "@gooddata/sdk-model";
import { InvertableSelectStatusBar } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterSelectionStatusProps {
    isInverted: boolean;
    selectedItems: IAttributeElement[];
    getItemTitle: (item: IAttributeElement) => string;
    selectedItemsLimit: number;
}

/**
 * @internal
 */
export const AttributeFilterSelectionStatus: React.FC<IAttributeFilterSelectionStatusProps> = (props) => {
    const { isInverted, selectedItems, getItemTitle, selectedItemsLimit } = props;
    return (
        <InvertableSelectStatusBar
            className="gd-attribute-filter-selection-status__next"
            isInverted={isInverted}
            getItemTitle={getItemTitle}
            selectedItems={selectedItems}
            selectedItemsLimit={selectedItemsLimit}
        />
    );
};
