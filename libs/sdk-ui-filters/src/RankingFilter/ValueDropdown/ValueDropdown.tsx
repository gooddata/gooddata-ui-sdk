// (C) 2020 GoodData Corporation
import React from "react";
import { DynamicSelect } from "../../DateFilter/DynamicSelect/DynamicSelect.js";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { sanitizeCustomInput, sanitizeInput } from "./utils.js";

interface IValueDropdownOwnProps {
    selectedValue: number;
    onSelect: (value: number) => void;
}

type ValueDropdownProps = IValueDropdownOwnProps & WrappedComponentProps;

const ValueDropdownComponent: React.FC<ValueDropdownProps> = ({ selectedValue, onSelect, intl }) => {
    const getDropdownItems = (value: string) => sanitizeInput(value, intl);
    return (
        <DynamicSelect
            getItems={getDropdownItems}
            onChange={onSelect}
            value={selectedValue}
            className="gd-rf-value-dropdown-button s-rf-value-dropdown-button"
            optionClassName="s-rf-value-dropdown-item"
            customValueValidator={sanitizeCustomInput}
        />
    );
};

export const ValueDropdown = injectIntl(ValueDropdownComponent);
