// (C) 2026 GoodData Corporation

import { type ChangeEvent, type KeyboardEvent, type MouseEvent, type Ref, forwardRef, useState } from "react";

import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { type IUiDropdownButtonRenderProps } from "../UiDropdown/types.js";
import { hasSystemModifier } from "../UiToolbar/rovingFocusUtils.js";
import { isPopupKey } from "../UiToolbarButton/useToolbarItemRole.js";
import { UiToolbarIconButton } from "../UiToolbarIconButton/UiToolbarIconButton.js";

/**
 * @internal
 */
export interface IUiToolbarStepperAccessibilityConfig {
    /**
     * Name of the value, for example "Zoom" or "Page".
     */
    ariaLabel: string;
    /**
     * Name of the increase control, for example "Zoom in" or "Next page".
     */
    incrementLabel: string;
    /**
     * Name of the decrease control, for example "Zoom out" or "Previous page".
     */
    decrementLabel: string;
}

/**
 * @internal
 */
export interface IUiToolbarStepperProps {
    /**
     * "value" adjusts a quantity with minus and plus. "pagination" moves through a sequence with
     * left and right arrows and shows the value as a readout.
     */
    variant: "value" | "pagination";
    /**
     * The committed value as text, for example "100%" or "1 / 2".
     */
    value: string;
    onStep: (direction: 1 | -1) => void;
    /**
     * @defaultValue true
     */
    canStepUp?: boolean;
    /**
     * @defaultValue true
     */
    canStepDown?: boolean;
    isDisabled?: boolean;
    accessibilityConfig: IUiToolbarStepperAccessibilityConfig;
    decreaseIcon?: IconType;
    increaseIcon?: IconType;
    /**
     * Makes the value of the "value" variant editable. Enter commits the typed text. Escape and blur
     * revert the typed text to the committed value.
     */
    onCommit?: (value: string) => void;
    /**
     * Reports every change of the typed text. A consumer that applies the text live must pass it
     * back as `value` while it is being typed, because `value` is what the field shows. Such a
     * consumer has committed each keystroke already, so Escape and blur restore the `value` it
     * passes and any return to the text from before the edit is its own to make. A consumer that
     * waits for `onCommit` leaves `value` alone and gets that return from the field.
     */
    onDraftChange?: (draft: string) => void;
    /**
     * Marks the typed text as not acceptable.
     * @defaultValue false
     */
    isInvalid?: boolean;
    /**
     * Shown in the editable value while it is empty.
     */
    placeholder?: string;
    /**
     * Held while the preset list is on screen.
     * @defaultValue false
     */
    isOpen?: boolean;
    /**
     * Attributes from the `renderButton` callback of a {@link UiDropdown} with `triggerRole: "combobox"`.
     */
    ariaAttributes?: IUiDropdownButtonRenderProps["ariaAttributes"];
    inputRef?: Ref<HTMLInputElement>;
    onClick?: (event: MouseEvent<HTMLInputElement>) => void;
    /**
     * Runs before the built-in key handling, which is skipped when the event is default-prevented.
     */
    onInputKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    dataTestId?: string;
}

const { b, e } = bem("gd-ui-kit-toolbar-stepper");

// The side buttons are not the popup trigger. An enclosing dropdown wrapper would otherwise toggle
// its popup on these keys and cancel the buttons' native click.
function keepPopupKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isPopupKey(event)) {
        return;
    }
    event.stopPropagation();
    // Enter and Space keep their default so the button still clicks; the arrows would only scroll.
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
        event.preventDefault();
    }
}

const DEFAULT_ICONS: Record<IUiToolbarStepperProps["variant"], { decrease: IconType; increase: IconType }> = {
    value: { decrease: "minus", increase: "plus" },
    pagination: { decrease: "navigateLeft", increase: "navigateRight" },
};

/**
 * Two side controls around a value. Each part is its own toolbar stop.
 *
 * @internal
 */
export const UiToolbarStepper = forwardRef<HTMLDivElement, IUiToolbarStepperProps>(function UiToolbarStepper(
    {
        variant,
        value,
        onStep,
        canStepUp = true,
        canStepDown = true,
        isDisabled = false,
        accessibilityConfig,
        decreaseIcon,
        increaseIcon,
        onCommit,
        onDraftChange,
        isInvalid = false,
        placeholder,
        isOpen = false,
        ariaAttributes,
        inputRef,
        onClick,
        onInputKeyDown,
        dataTestId,
    },
    ref,
) {
    const isEditable = variant === "value" && onCommit !== undefined;

    const [draft, setDraft] = useState(value);
    const [committed, setCommitted] = useState(value);
    // The text last typed, while it may still come back as `value`.
    const [typed, setTyped] = useState<string>();
    // What the status region says. A value that merely echoes the typed text is left out: the
    // input reads the keystrokes itself, and a second reading of each one would talk over it.
    const [announced, setAnnounced] = useState(value);
    if (committed !== value) {
        setCommitted(value);
        setDraft(value);
        if (value !== typed) {
            setAnnounced(value);
        }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        // A disabled value is read-only but focusable; the keys that would open an enclosing
        // dropdown are swallowed so the popup stays closed.
        if (isDisabled) {
            if (isPopupKey(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }
        onInputKeyDown?.(event);
        if (event.defaultPrevented) {
            return;
        }
        // While an IME is composing, the arrows walk the candidate list and Enter accepts a
        // candidate. Those presses belong to the input method, not to the stepper.
        if (event.nativeEvent.isComposing) {
            return;
        }

        // Modified arrows are left alone: Alt+ArrowDown opens the preset list of a combobox and
        // the other combinations belong to the browser or the OS.
        if (event.code === "ArrowUp" && !hasSystemModifier(event)) {
            event.preventDefault();
            event.stopPropagation();
            if (canStepUp) {
                setTyped(undefined);
                onStep(1);
            }
        } else if (event.code === "ArrowDown" && !hasSystemModifier(event)) {
            event.preventDefault();
            event.stopPropagation();
            if (canStepDown) {
                setTyped(undefined);
                onStep(-1);
            }
        } else if (event.code === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            setTyped(undefined);
            onCommit?.(draft);
        } else if (event.code === "Escape") {
            // Not stopped: an enclosing dropdown closes its preset list on the same key.
            setTyped(undefined);
            setDraft(value);
        }
    };

    const icons = DEFAULT_ICONS[variant];

    return (
        <div ref={ref} className={b({ variant })} data-testid={dataTestId}>
            <UiToolbarIconButton
                size="small"
                icon={decreaseIcon ?? icons.decrease}
                label={accessibilityConfig.decrementLabel}
                isDisabled={isDisabled || !canStepDown}
                onClick={() => onStep(-1)}
                onKeyDown={keepPopupKeys}
            />
            {isEditable ? (
                <input
                    ref={inputRef}
                    className={e("value", { isEditable, isActive: isOpen, isInvalid })}
                    type="text"
                    inputMode="decimal"
                    value={draft}
                    placeholder={placeholder}
                    aria-label={accessibilityConfig.ariaLabel}
                    aria-disabled={isDisabled || undefined}
                    aria-invalid={isInvalid || undefined}
                    readOnly={isDisabled}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setDraft(event.target.value);
                        setTyped(event.target.value);
                        onDraftChange?.(event.target.value);
                    }}
                    onBlur={() => {
                        setTyped(undefined);
                        setDraft(value);
                    }}
                    onClick={isDisabled ? undefined : onClick}
                    onKeyDown={handleKeyDown}
                    {...ariaAttributes}
                />
            ) : (
                <span
                    className={e("value", { isEditable })}
                    role="status"
                    aria-label={accessibilityConfig.ariaLabel}
                >
                    {value}
                </span>
            )}
            {isEditable ? (
                <span className="sr-only" role="status">
                    {`${accessibilityConfig.ariaLabel} ${announced}`}
                </span>
            ) : null}
            <UiToolbarIconButton
                size="small"
                icon={increaseIcon ?? icons.increase}
                label={accessibilityConfig.incrementLabel}
                isDisabled={isDisabled || !canStepUp}
                onClick={() => onStep(1)}
                onKeyDown={keepPopupKeys}
            />
        </div>
    );
});
