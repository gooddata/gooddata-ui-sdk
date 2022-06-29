// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { IAttributeFilterDropdownBodyProps } from "./types";

export const AttributeFilterDropdownBody: React.FC<IAttributeFilterDropdownBodyProps> = (props) => {
    const { hasNoMatchingData, isApplyDisabled, onApplyButtonClicked, closeDropdown, hasNoData, bodyProps } =
        props;

    const onApply = useCallback(() => {
        onApplyButtonClicked();
        closeDropdown();
    }, [closeDropdown, onApplyButtonClicked]);

    const { AttributeFilterDropdownButtons, AttributeFilterDropdownContent } =
        useAttributeFilterComponentsContext();

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
