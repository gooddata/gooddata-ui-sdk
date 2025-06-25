// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "./asyncTableBem.js";
import { UiCheckbox } from "../../@ui/UiCheckbox/UiCheckbox.js";
import { IAsyncTableCheckboxProps } from "./types.js";

export function AsyncTableCheckbox({ onChange, checked, indeterminate, disabled }: IAsyncTableCheckboxProps) {
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
