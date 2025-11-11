// (C) 2025 GoodData Corporation

import { ChangeEvent } from "react";

import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface UiCheckboxProps {
    checked: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    preventDefault?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    accessibilityConfig?: IAccessibilityConfigBase;
    tabIndex?: number;
    label?: string;
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
    accessibilityConfig,
    tabIndex,
    label,
}: UiCheckboxProps) {
    return (
        <label className={b()} {...accessibilityConfigToAttributes(accessibilityConfig)}>
            <input
                type="checkbox"
                className={e("input")}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                aria-checked={indeterminate ? "mixed" : checked}
                onClick={(e) => preventDefault && e.stopPropagation()}
                tabIndex={tabIndex}
            />
            <span className={e("box", { checked, indeterminate, disabled })} />
            {label ? <span className={e("label")}>{label}</span> : null}
        </label>
    );
}
