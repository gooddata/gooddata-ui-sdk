// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { useAttributeFilterDropdownButtons } from "./AttributeFilterDropdownButtons";
import { useAttributeFilterDropdownContent } from "./AttributeFilterDropdownContent";
import { IAttributeFilterDropdownBodyProps } from "./types";

export const AttributeFilterDropdownBody: React.FC<IAttributeFilterDropdownBodyProps> = (props) => {
    const { onApplyButtonClicked, closeDropdown } = props;

    const onApply = useCallback(() => {
        onApplyButtonClicked();
        closeDropdown();
    }, [closeDropdown, onApplyButtonClicked]);

    const { AttributeFilterDropdownButtons, AttributeFilterDropdownContent } =
        useAttributeFilterComponentsContext();

    const dropdownContentProps = useAttributeFilterDropdownContent();
    const dropdownButtonsProps = useAttributeFilterDropdownButtons({
        onApplyButtonClicked: onApply,
        onCloseButtonClicked: closeDropdown,
    });

    return (
        <div className="gd-attribute-filter-overlay__next">
            <AttributeFilterDropdownContent {...dropdownContentProps} />
            <AttributeFilterDropdownButtons {...dropdownButtonsProps} />
        </div>
    );
};
