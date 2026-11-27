// (C) 2026 GoodData Corporation

import {
    type ChangeEvent,
    type InputHTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
} from "react";

import { isArrowDownKey, isArrowKey } from "@gooddata/sdk-ui-kit";

import { PeriodRangeAccessibilityContext } from "./periodRangePickerAccessibility.js";

interface IAccessibleFieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
    "date-range"?: "start" | "end";
}

/**
 * Replaces the plain `<input>` rc-picker renders for each half of the date range, adding the accessibility
 * attributes our a11y model needs - a visible label that doubles as the accessible name, an invalid state,
 * and a description pointing at a format hint or an error - plus that field's own leading calendar icon and
 * bordered box. Typing, masking and focus stay with rc-picker.
 *
 * @remarks
 * The label and the icon are rendered here because rc-picker's own icon props render once for the whole
 * range control, not once per field, and rc-picker has no per-field label slot. Returning a fragment is
 * safe: rc-picker reaches the input through `ref`. The icon is inert - `aria-hidden` plus
 * `pointer-events: none` - so it adds no tab stop, and it is positioned over the input rather than beside
 * it, so a click on it activates this field.
 *
 * Two facts are only observable here: whether the typed text failed to parse, and whether the field is
 * currently blank. Both are reported upward raw, via an effect; the surrounding picker turns them into an
 * error kind or message. The user emptying the field is reported too, as it happens.
 */
export const AccessibleFieldInput = forwardRef<HTMLInputElement, IAccessibleFieldInputProps>((props, ref) => {
    const { "date-range": side, "aria-invalid": rcPickerInvalid, onKeyDown, onChange, ...restProps } = props;
    const accessibility = useContext(PeriodRangeAccessibilityContext);
    const field = side ? accessibility?.[side] : undefined;
    const isCalendarOpen = accessibility?.isCalendarOpen ?? false;
    const onFieldCleared = accessibility?.onFieldCleared;
    const onRequestOpen = accessibility?.onRequestOpen;
    const onEnterCommit = accessibility?.onEnterCommit;
    const ignoreEnter = accessibility?.ignoreEnter ?? false;
    const hasParseError = rcPickerInvalid === true;
    const isBlank = !props.value;

    // Focuses the field while the click is still bubbling: rc-picker moves focus to the start field on any click
    // that finds focus outside the picker, and the label's own focusing runs only after the click, so the start
    // field would be focused and blurred first, which commits it and marks it touched.
    const handleLabelClick = useCallback((e: MouseEvent<HTMLLabelElement>) => {
        e.currentTarget.control?.focus();
    }, []);

    useEffect(() => {
        if (side) {
            accessibility?.onFieldStateChange(side, { hasParseError, isBlank });
        }
    }, [accessibility, side, hasParseError, isBlank]);

    // Read from the change event rather than from `isBlank`: rc-picker also empties the text itself when it
    // resets a field to an empty value, which is not the user clearing it.
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            if (side && e.target.value === "") {
                onFieldCleared?.(side);
            }
        },
        [onChange, side, onFieldCleared],
    );

    // rc-picker's own key handling (forwarded as onKeyDown) must still run first; stopping propagation
    // afterwards for arrow/Home/End keys - without preventDefault - lets the browser move the caret normally
    // instead of DateFilterBody/DateFilterCore treating it as back/roving-focus navigation.
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                // rc-picker would confirm the field and move focus to the other one. Enter commits in place
                // instead, keeping the caret where the user is typing. In ALL_AT_ONCE mode blur is the only
                // commit point.
                if (!ignoreEnter && side) {
                    onEnterCommit?.(side);
                }
                return;
            }
            onKeyDown?.(e);

            if (isArrowKey(e) || e.key === "Home" || e.key === "End") {
                e.stopPropagation();
            }
            // rc-picker already closes its own calendar on Escape internally; without this, the event keeps
            // bubbling up to DateFilterBody, which would also step the form back to the option list. The Tab
            // branch is a deliberate extra guard so Tab-ing between the two fields, which the browser handles
            // natively, never also reaches the outer handlers' own key routing.
            if (isCalendarOpen && (e.key === "Escape" || e.key === "Tab")) {
                e.stopPropagation();
            }

            // rc-picker silently swallows every "open" request while the field is being typed into, so opening
            // the calendar via keyboard has to be detected explicitly here rather than relying on rc-picker's
            // own onOpenChange. Alt+ArrowDown rather than plain ArrowDown: it matches the ARIA combobox pattern's
            // "open the popup without moving focus" binding, and leaves bare ArrowUp/ArrowDown free to move
            // the caret inside the field, which is what the stopPropagation above is there to preserve.
            if (!isCalendarOpen && e.altKey && isArrowDownKey(e)) {
                onRequestOpen?.();
            }
        },
        [onKeyDown, isCalendarOpen, onRequestOpen, onEnterCommit, ignoreEnter, side],
    );

    return (
        <>
            {field ? (
                <label
                    className="gd-period-range-picker__label"
                    htmlFor={props.id}
                    onClick={handleLabelClick}
                >
                    {field.label}
                </label>
            ) : null}
            <span className="gd-period-range-picker__field">
                <span className="gd-icon-calendar" aria-hidden="true" />
                <input
                    ref={ref}
                    {...restProps}
                    date-range={side}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    // `hasParseError` looks redundant with `field.errorKind` (resolveFieldErrorKind already
                    // returns "invalid" whenever hasParseError), but isn't: hasParseError reflects this render, while
                    // field.errorKind comes from the parent's state, which only catches up after this component's
                    // effect fires post-commit. Dropping it would leave aria-invalid="false" for one render right
                    // after the first unparsable keystroke.
                    aria-invalid={field ? hasParseError || field.errorKind !== undefined : rcPickerInvalid}
                    aria-describedby={
                        field ? (field.errorKind === undefined ? field.hintId : field.errorId) : undefined
                    }
                />
            </span>
        </>
    );
});
AccessibleFieldInput.displayName = "AccessibleFieldInput";
