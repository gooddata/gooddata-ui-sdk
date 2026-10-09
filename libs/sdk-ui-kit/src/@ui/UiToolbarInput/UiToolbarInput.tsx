// (C) 2026 GoodData Corporation

import { type ChangeEvent, type KeyboardEvent, type Ref, forwardRef, useId, useState } from "react";

import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { hasSystemModifier } from "../UiToolbar/rovingFocusUtils.js";

/**
 * @internal
 */
export interface IUiToolbarInputAccessibilityConfig {
    /**
     * Name of the value, for example "Width". Always the full name, never only the prefix letter.
     */
    ariaLabel: string;
    /**
     * Spoken form of the unit, for example "pixels". Defaults to `unit`.
     */
    unitLabel?: string;
}

/**
 * @internal
 */
export interface IUiToolbarInputProps {
    /**
     * The committed value as text, for example "120".
     */
    value: string;
    /**
     * Called with the typed text on Enter and on blur. Escape reverts the typed text instead.
     * After a commit the field shows `value` again, so a parent that clamps or rejects the text
     * only has to keep `value` as it wants it. While `isInvalid` is true, the typed text stays.
     */
    onCommit: (value: string) => void;
    /**
     * Called on ArrowUp and ArrowDown. `isLargeStep` is true while Shift is held.
     */
    onStep?: (direction: 1 | -1, isLargeStep: boolean) => void;
    /**
     * A short text before the value that names it, for example "W". Use either `prefix` or
     * `prefixIcon`, not both.
     */
    prefix?: string;
    /**
     * A 14px icon before the value that names it. Never a generic icon such as search.
     */
    prefixIcon?: IconType;
    /**
     * The unit after the value, for example "px", "%" or "°".
     */
    unit?: string;
    /**
     * Width of the field in pixels. Size it for the longest value in its range so the toolbar does
     * not move while typing.
     * @defaultValue 64
     */
    width?: number;
    isDisabled?: boolean;
    /**
     * Marks the typed text as not acceptable.
     * @defaultValue false
     */
    isInvalid?: boolean;
    placeholder?: string;
    accessibilityConfig: IUiToolbarInputAccessibilityConfig;
    inputRef?: Ref<HTMLInputElement>;
    dataTestId?: string;
}

const { b, e } = bem("gd-ui-kit-toolbar-input");

const DEFAULT_WIDTH = 64;

/**
 * A typable number field with an optional prefix and unit. The prefix stays on the left; the value
 * and the unit are aligned to the right.
 *
 * @internal
 */
export const UiToolbarInput = forwardRef<HTMLLabelElement, IUiToolbarInputProps>(function UiToolbarInput(
    {
        value,
        onCommit,
        onStep,
        prefix,
        prefixIcon,
        unit,
        width = DEFAULT_WIDTH,
        isDisabled = false,
        isInvalid = false,
        placeholder,
        accessibilityConfig,
        inputRef,
        dataTestId,
    },
    ref,
) {
    const unitId = useId();

    const [draft, setDraft] = useState(value);
    const [committed, setCommitted] = useState(value);
    // The text last typed, while it may still come back as `value`.
    const [typed, setTyped] = useState<string>();
    // What the status region says. A value that merely echoes the typed text is left out: the
    // input reads the keystrokes itself, and a second reading of each one would talk over it.
    const [announced, setAnnounced] = useState(value);
    // The text last sent to onCommit, so Enter followed by blur commits it only once.
    const [sent, setSent] = useState<string>();
    // Set by a commit. On the next render the field shows `value` again, which also covers a
    // parent that clamps or rejects the text and so keeps `value` as it was. A parent that marks
    // the text invalid keeps it in the field instead, so the user can correct it.
    const [isCommitPending, setIsCommitPending] = useState(false);
    if (committed !== value) {
        setCommitted(value);
        setDraft(value);
        if (value !== typed) {
            setAnnounced(value);
        }
    }
    if (isCommitPending) {
        setIsCommitPending(false);
        if (!isInvalid) {
            setDraft(value);
        }
    }

    const commitDraft = () => {
        if (draft !== value && draft !== sent) {
            setTyped(undefined);
            setSent(draft);
            setIsCommitPending(true);
            onCommit(draft);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        // While an IME is composing, the arrows and Enter belong to the input method.
        if (isDisabled || event.nativeEvent.isComposing) {
            return;
        }
        if ((event.code === "ArrowUp" || event.code === "ArrowDown") && !hasSystemModifier(event)) {
            if (onStep) {
                event.preventDefault();
                setTyped(undefined);
                onStep(event.code === "ArrowUp" ? 1 : -1, event.shiftKey);
            }
        } else if (event.code === "Enter") {
            event.preventDefault();
            commitDraft();
        } else if (event.code === "Escape") {
            setTyped(undefined);
            setDraft(value);
        }
    };

    const unitLabel = unit ? (accessibilityConfig.unitLabel ?? unit) : undefined;

    return (
        <label ref={ref} className={b({ isDisabled, isInvalid })} style={{ width }} data-testid={dataTestId}>
            {prefixIcon ? (
                <span className={e("prefix")}>
                    <UiIcon
                        type={prefixIcon}
                        size={14}
                        color="currentColor"
                        accessibilityConfig={{ ariaHidden: true }}
                    />
                </span>
            ) : prefix ? (
                <span className={e("prefix")} aria-hidden>
                    {prefix}
                </span>
            ) : null}
            <input
                ref={inputRef}
                className={e("value")}
                type="text"
                inputMode="decimal"
                value={draft}
                placeholder={placeholder}
                aria-label={accessibilityConfig.ariaLabel}
                aria-describedby={unit ? unitId : undefined}
                aria-disabled={isDisabled || undefined}
                aria-invalid={isInvalid || undefined}
                readOnly={isDisabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setDraft(event.target.value);
                    setTyped(event.target.value);
                    setSent(undefined);
                }}
                onBlur={isDisabled ? undefined : commitDraft}
                onKeyDown={handleKeyDown}
            />
            {unit ? (
                <>
                    <span className={e("unit")} aria-hidden>
                        {unit}
                    </span>
                    <span id={unitId} className="sr-only">
                        {unitLabel}
                    </span>
                </>
            ) : null}
            <span className="sr-only" role="status">
                {[accessibilityConfig.ariaLabel, announced, unitLabel].filter(Boolean).join(" ")}
            </span>
        </label>
    );
});
