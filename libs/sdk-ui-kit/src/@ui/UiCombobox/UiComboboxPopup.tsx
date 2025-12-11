// (C) 2025 GoodData Corporation

import type { HTMLAttributes } from "react";

import cx from "classnames";

import { e } from "./comboboxBem.js";
import { useComboboxState } from "./UiComboboxContext.js";

/** @internal */
export type UiComboboxPopupProps = HTMLAttributes<HTMLDivElement>;

/** @internal */
export function UiComboboxPopup({ style, className, children, ...htmlProps }: UiComboboxPopupProps) {
    const { isOpen, setFloatingRef, getFloatingProps, floatingStyles, availableOptions } = useComboboxState();

    if (!isOpen || availableOptions.length === 0) {
        return null;
    }
    return (
        <div
            {...getFloatingProps(htmlProps)}
            ref={setFloatingRef}
            style={{ ...style, ...floatingStyles }}
            className={cx(e("popup"), className)}
            data-open={isOpen}
        >
            {children}
        </div>
    );
}
