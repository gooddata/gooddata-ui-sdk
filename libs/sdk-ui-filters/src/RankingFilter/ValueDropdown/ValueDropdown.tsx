// (C) 2020 GoodData Corporation
import React from "react";
import { DynamicSelect } from "../../DateFilter/DynamicSelect/DynamicSelect";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { sanitizeInput } from "./utils";

interface IValueDropdownOwnProps {
    selectedValue: number;
    onSelect: (value: number) => void;
}

type ValueDropdownProps = IValueDropdownOwnProps & WrappedComponentProps;

const ValueDropdownComponent: React.FC<ValueDropdownProps> = ({ selectedValue, onSelect, intl }) => {
    const getDropdownItems = (value: string) => {
        return sanitizeInput(value, intl);
    };

    return (
        <DynamicSelect
            getItems={getDropdownItems}
            onChange={onSelect}
            value={selectedValue}
            className="gd-rf-value-dropdown-button s-rf-value-dropdown-button"
            optionClassName="s-rf-value-dropdown-item"
        />
    );
};

export const ValueDropdown = injectIntl(ValueDropdownComponent);
