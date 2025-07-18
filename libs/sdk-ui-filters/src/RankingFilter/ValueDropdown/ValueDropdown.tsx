// (C) 2020-2025 GoodData Corporation
import { DynamicSelect } from "../../DateFilter/DynamicSelect/DynamicSelect.js";
import { useIntl } from "react-intl";
import { sanitizeCustomInput, sanitizeInput } from "./utils.js";

interface ValueDropdownProps {
    selectedValue: number;
    onSelect: (value: number) => void;
}

export function ValueDropdown({ selectedValue, onSelect }: ValueDropdownProps) {
    const intl = useIntl();

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
}
