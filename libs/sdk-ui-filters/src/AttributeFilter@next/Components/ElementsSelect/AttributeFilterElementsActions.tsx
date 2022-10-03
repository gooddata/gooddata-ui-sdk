// (C) 2021-2022 GoodData Corporation
import React from "react";
import { InvertableSelectAllCheckbox } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterElementsActionsProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    onToggle: () => void;
    isFiltered: boolean;
    totalItemsCount: number;
    isPartialSelection: boolean;
    isVisible: boolean;
}

/**
 * @internal
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
