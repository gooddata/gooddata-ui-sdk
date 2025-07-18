// (C) 2025 GoodData Corporation

import { e } from "./asyncTableBem.js";
import { IAsyncTableDropdownItemProps } from "./types.js";

const AsyncTableDropdownItem = ({ label, onSelect, isSelected }: IAsyncTableDropdownItemProps) => (
    <div className={e("dropdown-item", { selected: isSelected })} onClick={onSelect}>
        {label}
    </div>
);

export default AsyncTableDropdownItem;
