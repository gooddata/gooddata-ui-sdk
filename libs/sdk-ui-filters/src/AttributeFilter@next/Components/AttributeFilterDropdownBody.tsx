// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import {
    AttributeFilterDropdownContent,
    IAttributeDropdownBodyPropsNoCallbacks,
} from "./AttributeFilterDropdownContent";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";

export interface IAttributeFilterDropdownBodyProps {
    hasNoMatchingData: boolean;
    hasNoData: boolean;
    isApplyDisabled: boolean;
    bodyProps: IAttributeDropdownBodyPropsNoCallbacks;
    onApplyButtonClicked: () => void;
    closeDropdown: () => void;
}

export const AttributeFilterDropdownBody: React.FC<IAttributeFilterDropdownBodyProps> = (props) => {
    const { hasNoMatchingData, isApplyDisabled, onApplyButtonClicked, closeDropdown, hasNoData, bodyProps } =
        props;

    const onApply = useCallback(() => {
        onApplyButtonClicked();
        closeDropdown();
    }, [closeDropdown, onApplyButtonClicked]);

    const { AttributeFilterDropdownButtons } = useAttributeFilterComponentsContext();

    const isApplyButtonDisabled = isApplyDisabled || hasNoData || hasNoMatchingData || !!bodyProps.error;

    return (
        <div className="gd-attribute-filter-overlay__next">
            <AttributeFilterDropdownContent {...bodyProps} />
            <AttributeFilterDropdownButtons
                isApplyDisabled={isApplyButtonDisabled}
                onApplyButtonClicked={onApply}
                onCloseButtonClicked={closeDropdown}
            />
        </div>
    );
};
