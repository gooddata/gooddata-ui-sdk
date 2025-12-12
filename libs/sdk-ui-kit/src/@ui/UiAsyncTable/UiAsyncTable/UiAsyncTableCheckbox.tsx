// (C) 2025 GoodData Corporation

import { type Ref } from "react";

import { getColumnHeaderId, stopPropagationCallback } from "./utils.js";
import { isActionKey } from "../../../utils/events.js";
import { UiCheckbox } from "../../UiCheckbox/UiCheckbox.js";
import { e } from "../asyncTableBem.js";
import { type UiAsyncTableCheckboxProps } from "../types.js";
import { ASYNC_TABLE_SELECTED_COUNT_ID } from "./constants.js";

export function UiAsyncTableCheckbox({
    onChange,
    checked,
    indeterminate,
    disabled,
    ariaLabel,
    isCellFocused,
    header,
    cellRef,
}: UiAsyncTableCheckboxProps) {
    return (
        <div
            className={e("cell", { checkbox: true, focused: isCellFocused ?? false })}
            role={header ? undefined : "gridcell"}
            aria-labelledby={header ? undefined : getColumnHeaderId("checkbox")}
            aria-describedby={header ? ASYNC_TABLE_SELECTED_COUNT_ID : undefined}
            onClick={(e) => {
                stopPropagationCallback(e, onChange);
            }}
            onKeyDown={(e) => {
                if (isActionKey(e)) {
                    stopPropagationCallback(e, onChange);
                }
            }}
            ref={cellRef as Ref<HTMLDivElement>}
        >
            <UiCheckbox
                checked={checked ?? false}
                preventDefault
                indeterminate={indeterminate}
                disabled={disabled}
                accessibilityConfig={ariaLabel ? { ariaLabel } : undefined}
                tabIndex={header ? 0 : -1}
            />
        </div>
    );
}
