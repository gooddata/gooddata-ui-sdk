// (C) 2025 GoodData Corporation

import { type ChangeEvent, useEffect, useRef } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
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
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <label className={b()}>
            <input
                ref={inputRef}
                type="checkbox"
                className={e("input")}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                onClick={(e) => preventDefault && e.stopPropagation()}
                tabIndex={tabIndex}
                {...accessibilityConfigToAttributes(accessibilityConfig)}
            />
            <span className={e("box", { checked, indeterminate, disabled })} />
            {label ? <span className={e("label") + " gd-label"}>{label}</span> : null}
        </label>
    );
}
