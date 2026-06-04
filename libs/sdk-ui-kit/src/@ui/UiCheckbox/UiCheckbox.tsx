// (C) 2025-2026 GoodData Corporation

import { type ChangeEvent, useEffect, useId, useRef } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface IUiCheckboxProps {
    checked: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    accessibilityConfig?: IAccessibilityConfigBase;
    tabIndex?: number;
    label?: string;
    /**
     * Id set on the native input. When omitted a stable id is generated.
     * Pass an explicit id when an ancestor renders its own
     * `<label htmlFor={id}>` so the two stay associated.
     */
    id?: string;
}

const { b, e } = bem("gd-ui-kit-checkbox");

/**
 * Checkbox control — renders a native `<input type="checkbox">` for
 * accessibility and a custom 14px box for the visual. The input is overlaid on
 * the box, so clicking the box toggles it. Renders no wrapping `<label>`: an
 * optional inline label is a sibling associated via `htmlFor`, which lets an
 * ancestor row supply its own label without nesting.
 *
 * @internal
 */
export function UiCheckbox({
    checked,
    onChange = () => {},
    preventDefault = false,
    stopPropagation = false,
    indeterminate = false,
    disabled = false,
    accessibilityConfig,
    tabIndex,
    label,
    id,
}: IUiCheckboxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <span className={b()}>
            <span className={e("control")}>
                <input
                    ref={inputRef}
                    id={inputId}
                    type="checkbox"
                    className={e("input")}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    onClick={(e) => {
                        if (preventDefault) {
                            e.preventDefault();
                        }
                        if (stopPropagation) {
                            e.stopPropagation();
                        }
                    }}
                    tabIndex={tabIndex}
                    {...accessibilityConfigToAttributes(accessibilityConfig)}
                />
                <span className={e("box", { checked, indeterminate, disabled })} aria-hidden="true" />
            </span>
            {label ? (
                <label className={e("label") + " gd-label"} htmlFor={inputId}>
                    {label}
                </label>
            ) : null}
        </span>
    );
}
