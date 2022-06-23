// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import {
    AttributeFilterDropdownContent,
    IAttributeDropdownBodyPropsNoCallbacks,
} from "./AttributeFilterDropdownContent";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";

interface IAttributeFilterDropdownBodyProps {
    allElementsFiltered: boolean;
    hasNoData: boolean;
    applyDisabled: boolean;
    bodyProps: IAttributeDropdownBodyPropsNoCallbacks;
    onApplyButtonClicked: () => void;
    closeDropdown: () => void;
}

export const AttributeFilterDropdownBody: React.FC<IAttributeFilterDropdownBodyProps> = (props) => {
    const { allElementsFiltered, applyDisabled, onApplyButtonClicked, closeDropdown, hasNoData, bodyProps } =
        props;

    const onApply = useCallback(() => {
        onApplyButtonClicked();
        closeDropdown();
    }, [closeDropdown, onApplyButtonClicked]);

    const { AttributeFilterDropdownButtons } = useAttributeFilterComponentsContext();

    const applyButtonDisabled = applyDisabled || hasNoData || allElementsFiltered || !!bodyProps.error;

    return (
        <div className="gd-attribute-filter-overlay__next">
            <AttributeFilterDropdownContent {...bodyProps} />
            <AttributeFilterDropdownButtons
                applyDisabled={applyButtonDisabled}
                onApplyButtonClicked={onApply}
                onCloseButtonClicked={closeDropdown}
            />
        </div>
    );
};
