// (C) 2025 GoodData Corporation

import { UiCheckbox } from "../../../@ui/UiCheckbox/UiCheckbox.js";
import { e } from "../asyncTableBem.js";
import { UiAsyncTableDropdownItemProps } from "../types.js";

function UiAsyncTableDropdownItem({
    label,
    secondaryLabel,
    onClick,
    isSelected,
    isMultiSelect,
}: UiAsyncTableDropdownItemProps) {
    return (
        <div
            className={e("dropdown-item", { selected: isSelected, "multi-select": isMultiSelect })}
            onClick={onClick}
        >
            {isMultiSelect ? (
                <div className={e("dropdown-item-checkbox")}>
                    <UiCheckbox preventDefault checked={isSelected} tabIndex={-1} />
                </div>
            ) : null}
            <div className={e("dropdown-item-label-primary")}>{label}</div>
            {secondaryLabel ? (
                <div className={e("dropdown-item-label-secondary")}>{secondaryLabel}</div>
            ) : null}
        </div>
    );
}

export default UiAsyncTableDropdownItem;
