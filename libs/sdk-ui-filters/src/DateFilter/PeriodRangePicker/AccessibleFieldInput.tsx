// (C) 2026 GoodData Corporation

import {
    type InputHTMLAttributes,
    type KeyboardEvent,
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
 * A drop-in replacement for the plain `<input>` rc-picker renders for each half of the date range,
 * used only to layer on the accessibility attributes our a11y model needs - a label, an invalid
 * state, and a description pointing at either a format hint or an error message. Typing, masking,
 * and focus behavior all still belong to rc-picker; this component just decorates the props it's handed.
 *
 * @remarks
 * rc-picker exposes two facts only this component can observe directly: whether the typed text failed to
 * parse (as this input's own invalid state) and whether the field is currently blank (its own live displayed
 * text, which updates on every keystroke including a clear). Both are reported upward, raw and unresolved, via
 * an effect - the surrounding picker owns everything else needed to turn them into an error kind or message.
 */
export const AccessibleFieldInput = forwardRef<HTMLInputElement, IAccessibleFieldInputProps>((props, ref) => {
    const { "date-range": side, "aria-invalid": rcPickerInvalid, onKeyDown, ...restProps } = props;
    const accessibility = useContext(PeriodRangeAccessibilityContext);
    const field = side ? accessibility?.[side] : undefined;
    const isCalendarOpen = accessibility?.isCalendarOpen ?? false;
    const onRequestOpen = accessibility?.onRequestOpen;
    const enterCommitRef = accessibility?.enterCommitRef;
    const onEnterCommit = accessibility?.onEnterCommit;
    const ignoreEnter = accessibility?.ignoreEnter ?? false;
    const hasParseError = rcPickerInvalid === true;
    const isBlank = !props.value;

    useEffect(() => {
        if (side) {
            accessibility?.onFieldStateChange(side, { hasParseError, isBlank });
        }
    }, [accessibility, side, hasParseError, isBlank]);

    // rc-picker's own Enter/Escape field-confirmation logic (forwarded as onKeyDown) must still run first;
    // stopping propagation afterwards for arrow/Home/End keys - without preventDefault - lets the browser move
    // the caret normally instead of DateFilterBody/DateFilterCore treating it as back/roving-focus navigation.
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            // rc-picker confirms the field inside the handler forwarded below (its `onSharedKeyDown` calls
            // `onSubmit()`), but both the resulting `onChange` (when the round completes) and its own
            // deactivation `onBlur` (rc-picker's `useFocusEvents`, which defers via a microtask so that
            // tabbing between this picker's own two fields isn't briefly seen as blurring the whole thing)
            // land one microtask later, not synchronously within this call. The flag has to outlive that
            // microtask too, so the reset below is deferred with `queueMicrotask` rather than done
            // immediately - an immediate reset would already have flipped back to false by the time either
            // callback runs, defeating the guards in handleChange/handleFieldBlur. `finally` still matters
            // for scheduling the reset even if `onKeyDown`/`onEnterCommit` throws.
            const isEnter = e.key === "Enter";
            if (isEnter && ignoreEnter) {
                // In ALL_AT_ONCE mode the caret has to stay where the user is typing, and
                // blur is the only commit point.
                return;
            }
            if (isEnter && enterCommitRef) {
                enterCommitRef.current = true;
            }
            try {
                onKeyDown?.(e);
                if (isEnter) {
                    onEnterCommit?.();
                }
            } finally {
                if (isEnter && enterCommitRef) {
                    queueMicrotask(() => {
                        enterCommitRef.current = false;
                    });
                }
            }

            if (isArrowKey(e) || e.key === "Home" || e.key === "End") {
                e.stopPropagation();
            }
            // rc-picker already closes its own calendar on Escape internally; without this, the event keeps
            // bubbling up to DateFilterFormContent's outer keydown handler, whose `makeLinearKeyboardNavigation`
            // maps only Escape to closing the whole dropdown. The Tab branch below is not mirroring that
            // mapping - it's a deliberate extra guard so Tab-ing between the two fields, which the browser
            // handles natively, never also reaches that outer handler's own key routing.
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
        [onKeyDown, isCalendarOpen, onRequestOpen, enterCommitRef, onEnterCommit, ignoreEnter],
    );

    return (
        <input
            ref={ref}
            {...restProps}
            date-range={side}
            onKeyDown={handleKeyDown}
            aria-label={field?.ariaLabel}
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
    );
});
AccessibleFieldInput.displayName = "AccessibleFieldInput";
