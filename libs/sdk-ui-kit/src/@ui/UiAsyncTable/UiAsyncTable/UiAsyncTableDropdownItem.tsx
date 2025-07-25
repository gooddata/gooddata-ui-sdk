// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../asyncTableBem.js";
import { UiAsyncTableDropdownItemProps } from "../types.js";

const UiAsyncTableDropdownItem = ({ label, onSelect, isSelected }: UiAsyncTableDropdownItemProps) => (
    <div className={e("dropdown-item", { selected: isSelected })} onClick={onSelect}>
        {label}
    </div>
);

export default UiAsyncTableDropdownItem;
