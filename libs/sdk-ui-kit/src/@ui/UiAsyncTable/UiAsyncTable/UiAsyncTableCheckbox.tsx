// (C) 2025 GoodData Corporation

import { stopPropagationCallback } from "./utils.js";
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
        <div
            className={e("cell", { checkbox: true })}
            onClick={(e) => {
                stopPropagationCallback(e, onChange);
            }}
        >
            <UiCheckbox
                checked={checked}
                preventDefault={true}
                indeterminate={indeterminate}
                disabled={disabled}
            />
        </div>
    );
}
