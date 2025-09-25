// (C) 2025 GoodData Corporation

import { getColumnHeaderId, stopPropagationCallback } from "./utils.js";
import { UiCheckbox } from "../../UiCheckbox/UiCheckbox.js";
import { e } from "../asyncTableBem.js";
import { UiAsyncTableCheckboxProps } from "../types.js";

export function UiAsyncTableCheckbox({
    onChange,
    checked,
    indeterminate,
    disabled,
    ariaLabel,
    header,
}: UiAsyncTableCheckboxProps) {
    return (
        <div
            className={e("cell", { checkbox: true })}
            role={header ? "columnheader" : "gridcell"}
            id={header ? getColumnHeaderId("checkbox") : undefined}
            aria-labelledby={header ? undefined : getColumnHeaderId("checkbox")}
            onClick={(e) => {
                stopPropagationCallback(e, onChange);
            }}
        >
            <UiCheckbox
                checked={checked}
                preventDefault={true}
                indeterminate={indeterminate}
                disabled={disabled}
                accessibilityConfig={ariaLabel ? { ariaLabel } : undefined}
            />
        </div>
    );
}
