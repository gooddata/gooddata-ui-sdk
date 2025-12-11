// (C) 2025 GoodData Corporation

import {
    type ChangeEvent,
    type FocusEvent,
    type InputHTMLAttributes,
    type KeyboardEvent,
    forwardRef,
} from "react";

import { useMergeRefs } from "@floating-ui/react";
import cx from "classnames";

import { e } from "./comboboxBem.js";
import { useComboboxState } from "./UiComboboxContext.js";

/** @internal */
export type UiComboboxInputProps = InputHTMLAttributes<HTMLInputElement>;

/** @internal */
export const UiComboboxInput = forwardRef<HTMLInputElement, UiComboboxInputProps>(
    function UiComboboxInput(props, forwardedRef) {
        const { type, className, ...htmlInputProps } = props;
        const {
            inputValue,
            onInputChange,
            onInputKeyDown,
            onInputBlur,
            setReferenceRef,
            getReferenceProps,
            activeOption,
        } = useComboboxState();

        const ref = useMergeRefs([forwardedRef, setReferenceRef]);

        const referenceProps = getReferenceProps({
            ...htmlInputProps,
            autoComplete: "off",
            autoCapitalize: "none",
            autoCorrect: "off",
            // Most of the aria attributes already come from `getReferenceProps`
            "aria-activedescendant": activeOption?.id,
            "aria-autocomplete": "list",
            onKeyDown: handleKeyDown,
            onBlur: handleBlur,
        });

        function handleChange(event: ChangeEvent<HTMLInputElement>) {
            onInputChange(event.target.value);
            htmlInputProps.onChange?.(event);
        }

        function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
            onInputKeyDown(event);
            htmlInputProps.onKeyDown?.(event);
        }

        function handleBlur(event: FocusEvent<HTMLInputElement>) {
            onInputBlur();
            htmlInputProps.onBlur?.(event);
        }

        return (
            <input
                {...referenceProps}
                ref={ref}
                className={cx(e("input"), className)}
                type={type ?? "text"}
                value={inputValue}
                onChange={handleChange}
            />
        );
    },
);
