// (C) 2026 GoodData Corporation

import {
    type ChangeEvent,
    type FocusEventHandler,
    type KeyboardEventHandler,
    type MouseEventHandler,
    type Ref,
    useId,
} from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";

const { b, e } = bem("gd-ui-kit-text-input");

/**
 * Clickable trailing icon button (e.g. a clear button). Bundles its own
 * accessible name so the button can never be rendered unnamed.
 *
 * @internal
 */
export interface IUiTextInputIconAfterButton {
    /** Icon rendered inside the button. */
    icon: IconType;
    /** Fires on click. */
    onClick: () => void;
    /** Accessible name for the icon-only button. */
    ariaLabel: string;
}

/**
 * @internal
 */
export interface IUiTextInputProps {
    /** HTML input `type`. Defaults to `"text"`. */
    type?: "text" | "search" | "email" | "url";
    /** Current value. */
    value: string;
    /** Fires with the next value on every change. */
    onChange: (next: string) => void;
    /** Optional label rendered above the input. */
    label?: string;
    /** Placeholder shown when the input is empty. */
    placeholder?: string;
    /** Optional icon rendered inside the input at the start. */
    iconBefore?: IconType;
    /** Optional static (non-interactive) icon rendered inside the input at the end. */
    iconAfter?: IconType;
    /**
     * Optional interactive trailing icon button (e.g. a clear button). Takes
     * precedence over `iconAfter`. Carries its own `ariaLabel`, so the button
     * always has an accessible name.
     */
    onIconAfter?: IUiTextInputIconAfterButton;
    /** Accessibility config forwarded to the input element. */
    accessibilityConfig?: IAccessibilityConfigBase;
    disabled?: boolean;
    autoFocus?: boolean;
    /** Forwarded to the input element. Use for autocomplete / combobox patterns. */
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
    /** Forwarded to the input element. */
    onFocus?: FocusEventHandler<HTMLInputElement>;
    /** Forwarded to the input element. */
    onBlur?: FocusEventHandler<HTMLInputElement>;
    /** Forwarded to the input element. */
    onClick?: MouseEventHandler<HTMLInputElement>;
    /** Test id forwarded to the input element. */
    dataTestId?: string;
    inputRef?: Ref<HTMLInputElement>;
    /** Use as the floating-popup anchor when the popup should match the full field width. */
    wrapperRef?: Ref<HTMLDivElement>;
    name?: string;
    /**
     * Browser-autofill control. Combobox/autocomplete patterns should set
     * `"off"` so the native dropdown doesn't overlap the listbox.
     */
    autoComplete?: string;
    autoCapitalize?: string;
    autoCorrect?: string;
}

/**
 * Single-line text input with optional label and leading / trailing icons.
 * The kit's canonical text-field rendering: 32px height, 1px
 * complementary-4 border, inset shadow, primary-blue focus state.
 *
 * @internal
 */
export function UiTextInput({
    type = "text",
    value,
    onChange,
    label,
    placeholder,
    iconBefore,
    iconAfter,
    onIconAfter,
    accessibilityConfig,
    disabled = false,
    autoFocus = false,
    onKeyDown,
    onFocus,
    onBlur,
    onClick,
    dataTestId,
    inputRef,
    wrapperRef,
    name,
    autoComplete,
    autoCapitalize,
    autoCorrect,
}: IUiTextInputProps) {
    const id = useId();
    const { ariaLabel, ...restA11y } = accessibilityConfig ?? {};
    // When a visible <label> is present, the label provides the accessible name;
    // forwarding aria-label would override it (WCAG name-in-name mismatch).
    const inputA11y = label ? restA11y : { ...restA11y, ariaLabel };
    return (
        <div ref={wrapperRef} className={b()}>
            {label ? (
                <label className={e("label")} htmlFor={id}>
                    {label}
                </label>
            ) : null}
            <div className={e("field", { disabled })}>
                {iconBefore ? (
                    <span className={e("icon-before")}>
                        <UiIcon type={iconBefore} size={14} color="complementary-6" />
                    </span>
                ) : null}
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type={type}
                    className={e("input")}
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    data-testid={dataTestId}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onClick={onClick}
                    {...accessibilityConfigToAttributes(inputA11y)}
                />
                {onIconAfter ? (
                    <span className={e("icon-after")}>
                        <UiIconButton
                            icon={onIconAfter.icon}
                            size="xsmall"
                            variant="tertiary"
                            onClick={onIconAfter.onClick}
                            isDisabled={disabled}
                            label={onIconAfter.ariaLabel}
                            iconColor="complementary-6"
                        />
                    </span>
                ) : iconAfter ? (
                    <span className={e("icon-after")}>
                        <UiIcon type={iconAfter} size={14} color="complementary-6" />
                    </span>
                ) : null}
            </div>
        </div>
    );
}
