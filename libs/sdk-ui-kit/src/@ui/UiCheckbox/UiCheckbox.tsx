// (C) 2025 GoodData Corporation

import React from "react";

import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface UiCheckboxProps {
    checked: boolean;
    onChange?: (e: React.ChangeEvent) => void;
    preventDefault?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
}

const { b, e } = bem("gd-ui-kit-checkbox");

/**
 * @internal
 */
export function UiCheckbox({
    checked,
    onChange = () => {},
    preventDefault = false,
    indeterminate = false,
    disabled = false,
}: UiCheckboxProps) {
    return (
        <label className={b()}>
            <input
                type="checkbox"
                className={e("input")}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                onClick={(e) => preventDefault && e.stopPropagation()}
            />
            <span className={e("box", { checked, indeterminate, disabled })} />
        </label>
    );
}
