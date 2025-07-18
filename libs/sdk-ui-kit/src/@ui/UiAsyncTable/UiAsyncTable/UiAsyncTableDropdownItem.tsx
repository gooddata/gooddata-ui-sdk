// (C) 2025 GoodData Corporation

import { e } from "../asyncTableBem.js";
import { UiAsyncTableDropdownItemProps } from "../types.js";

function UiAsyncTableDropdownItem({ label, onSelect, isSelected }: UiAsyncTableDropdownItemProps) {
    return (
        <div className={e("dropdown-item", { selected: isSelected })} onClick={onSelect}>
            {label}
        </div>
    );
}

export default UiAsyncTableDropdownItem;
