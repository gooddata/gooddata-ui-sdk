// (C) 2026 GoodData Corporation

import { type ChangeEvent, useId } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { bem } from "../@utils/bem.js";

const { b, e } = bem("gd-ui-kit-radio");

/**
 * @internal
 */
export interface IUiRadioProps {
    /** Whether this radio is selected. */
    checked: boolean;
    /** Fires when the user toggles the radio. */
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    /**
     * `name` attribute shared by a group of mutually exclusive radios —
     * required by HTML radios.
     */
    name?: string;
    /** Value sent with the change event — the picked option's identifier. */
    value?: string;
    disabled?: boolean;
    accessibilityConfig?: IAccessibilityConfigBase;
    tabIndex?: number;
    /** Optional inline label rendered next to the radio circle. */
    label?: string;
    /**
     * Id set on the native input. When omitted a stable id is generated.
     * Pass an explicit id when an ancestor renders its own
     * `<label htmlFor={id}>` (e.g. `UiRadioRow`) so the two stay associated.
     */
    id?: string;
    dataTestId?: string;
}

/**
 * Standalone radio control — renders a native `<input type="radio">` for
 * accessibility and a custom 14px circle for the visual. The input is overlaid
 * on the circle, so clicking the circle toggles it. Renders no wrapping
 * `<label>`: an optional inline label is a sibling associated via `htmlFor`,
 * which lets `UiRadioRow` supply its own label without nesting.
 *
 * @internal
 */
export function UiRadio({
    checked,
    onChange = () => {},
    name,
    value,
    disabled = false,
    accessibilityConfig,
    tabIndex,
    label,
    id,
    dataTestId,
}: IUiRadioProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
        <span className={b()}>
            <span className={e("control")}>
                <input
                    id={inputId}
                    type="radio"
                    className={e("input")}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    name={name}
                    value={value}
                    tabIndex={tabIndex}
                    data-testid={dataTestId}
                    {...accessibilityConfigToAttributes(accessibilityConfig)}
                />
                <span className={e("circle", { checked, disabled })} aria-hidden="true" />
            </span>
            {label ? (
                <label className={e("label")} htmlFor={inputId}>
                    {label}
                </label>
            ) : null}
        </span>
    );
}
