// (C) 2025 GoodData Corporation

import React from "react";

import { UiCheckbox } from "../../UiCheckbox/UiCheckbox.js";
import { e } from "../asyncTableBem.js";
import { UiAsyncTableCheckboxProps } from "../types.js";

export function UiAsyncTableCheckbox({
    onChange,
    checked,
    indeterminate,
    disabled,
}: UiAsyncTableCheckboxProps) {
    return (
        <div className={e("cell", { checkbox: true })} onClick={onChange}>
            <UiCheckbox
                checked={checked}
                preventDefault={true}
                indeterminate={indeterminate}
                disabled={disabled}
            />
        </div>
    );
}
