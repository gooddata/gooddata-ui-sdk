// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../asyncTableBem.js";
import { UiAsyncTableDropdownItemProps } from "../types.js";

const UiAsyncTableDropdownItem = ({
    label,
    secondaryLabel,
    onSelect,
    isSelected,
}: UiAsyncTableDropdownItemProps) => (
    <div className={e("dropdown-item", { selected: isSelected })} onClick={onSelect}>
        <div className={e("dropdown-item-label-primary")}>{label}</div>
        {secondaryLabel ? <div className={e("dropdown-item-label-secondary")}>{secondaryLabel}</div> : null}
    </div>
);

export default UiAsyncTableDropdownItem;
