// (C) 2025-2026 GoodData Corporation

import {
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type Ref,
    forwardRef,
    useCallback,
} from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { UiTextInput } from "../UiTextInput/UiTextInput.js";

import { useComboboxState } from "./UiComboboxContext.js";

/** @internal */
export interface IUiComboboxInputProps {
    /**
     * Accessible name/description for the input (e.g. `ariaLabel`,
     * `ariaDescribedBy`). The combobox role and listbox-wiring attributes are
     * owned by the component and override anything passed here.
     */
    accessibilityConfig?: IAccessibilityConfigBase;
    /** Visible placeholder. */
    placeholder?: string;
    /** Form field name forwarded to the underlying input. */
    name?: string;
    autoFocus?: boolean;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    onClick?: (event: MouseEvent<HTMLInputElement>) => void;
    dataTestId?: string;
}

/**
 * Binds `UiTextInput` to the surrounding `UiCombobox` state: value, keyboard
 * handler, open/close, ARIA combobox+listbox attributes.
 *
 * @internal
 */
export const UiComboboxInput = forwardRef<HTMLInputElement, IUiComboboxInputProps>(
    function UiComboboxInput(props, forwardedRef) {
        const {
            accessibilityConfig,
            placeholder,
            name,
            autoFocus,
            onKeyDown: callerOnKeyDown,
            onFocus: callerOnFocus,
            onBlur: callerOnBlur,
            onClick: callerOnClick,
            dataTestId,
        } = props;

        const {
            inputValue,
            onInputChange,
            onInputKeyDown,
            onInputBlur,
            isOpen,
            setIsOpen,
            anchorRef,
            activeOption,
            listboxId,
        } = useComboboxState();

        const handleKeyDown = useCallback(
            (event: KeyboardEvent<HTMLInputElement>) => {
                onInputKeyDown(event);
                if (!event.isDefaultPrevented()) {
                    callerOnKeyDown?.(event);
                }
            },
            [onInputKeyDown, callerOnKeyDown],
        );

        const handleBlur = useCallback(
            (event: FocusEvent<HTMLInputElement>) => {
                onInputBlur();
                callerOnBlur?.(event);
            },
            [onInputBlur, callerOnBlur],
        );

        // Click toggles open state (matches floating-ui's default `useClick`),
        // so the user can also click to close. Focus alone doesn't open —
        // Tab / programmatic focus shouldn't expand the listbox.
        const handleClick = useCallback(
            (event: MouseEvent<HTMLInputElement>) => {
                setIsOpen(!isOpen);
                callerOnClick?.(event);
            },
            [isOpen, setIsOpen, callerOnClick],
        );

        return (
            <UiTextInput
                inputRef={forwardedRef}
                wrapperRef={anchorRef as Ref<HTMLDivElement>}
                value={inputValue}
                onChange={onInputChange}
                name={name}
                placeholder={placeholder}
                autoFocus={autoFocus}
                // Browser autofill would overlap the listbox; the combobox
                // owns its own typeahead so we suppress all native suggestions.
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                dataTestId={dataTestId}
                onKeyDown={handleKeyDown}
                onFocus={callerOnFocus}
                onBlur={handleBlur}
                onClick={handleClick}
                accessibilityConfig={{
                    ...accessibilityConfig,
                    role: "combobox",
                    ariaAutocomplete: "list",
                    ariaExpanded: isOpen,
                    ariaActiveDescendant: activeOption?.id,
                    ariaHaspopup: "listbox",
                    ariaControls: listboxId,
                }}
            />
        );
    },
);
