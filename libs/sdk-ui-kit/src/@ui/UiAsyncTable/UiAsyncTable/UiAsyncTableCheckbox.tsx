// (C) 2025-2026 GoodData Corporation

import { type Ref } from "react";

import { isActionKey } from "../../../utils/events.js";
import { UiCheckbox } from "../../UiCheckbox/UiCheckbox.js";
import { e } from "../asyncTableBem.js";
import { type UiAsyncTableCheckboxProps } from "../types.js";

import { ASYNC_TABLE_SELECTED_COUNT_ID } from "./constants.js";
import { getColumnHeaderId, stopPropagationCallback } from "./utils.js";

export function UiAsyncTableCheckbox({
    onChange,
    checked,
    indeterminate,
    disabled,
    ariaLabel,
    isCellFocused,
    header,
    cellRef,
    cellId,
}: UiAsyncTableCheckboxProps) {
    // The native input is now overlaid on the visible 14×14 control (kit
    // convention for @ui/UiCheckbox), so the input itself is the click
    // target and `stopPropagation` stops the click from bubbling to the
    // cell. Wire `onChange` through `UiCheckbox` so the toggle fires.
    // The cell-div retains keyboard handling (gridcell Space/Enter) and
    // bubbled clicks from any non-input area of the cell.
    return (
        <div
            className={e("cell", { checkbox: true, focused: isCellFocused ?? false })}
            role={header ? undefined : "gridcell"}
            id={cellId}
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
                stopPropagation
                onChange={onChange}
                indeterminate={indeterminate}
                disabled={disabled}
                accessibilityConfig={ariaLabel ? { ariaLabel } : undefined}
                tabIndex={header ? 0 : -1}
            />
        </div>
    );
}
