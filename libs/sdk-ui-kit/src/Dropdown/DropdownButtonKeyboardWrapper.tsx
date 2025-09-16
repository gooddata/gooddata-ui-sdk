// (C) 2025 GoodData Corporation

import { HTMLProps, KeyboardEventHandler, RefObject, forwardRef, useCallback } from "react";

import { isElementTextInput } from "../utils/domUtilities.js";

type IDropdownButtonKeyboardWrapperProps = {
    onToggle: (desiredState?: boolean | unknown) => void;
    closeOnEscape?: boolean;
    isOpen: boolean;
} & HTMLProps<HTMLDivElement>;

export const DropdownButtonKeyboardWrapper = forwardRef<HTMLElement, IDropdownButtonKeyboardWrapperProps>(
    function DropdownButtonKeyboardWrapper(
        { onToggle, isOpen, closeOnEscape = true, children, ...divProps },
        ref,
    ) {
        const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
            (event) => {
                const isInputFocused = isElementTextInput(document.activeElement);

                if (event.code === "Enter" || (event.code === "Space" && !isInputFocused)) {
                    onToggle();
                    event.preventDefault();
                }
                if (event.code === "Escape" && isOpen && closeOnEscape) {
                    onToggle(false);
                    event.preventDefault();
                }
                if (event.code === "ArrowUp" && isOpen) {
                    onToggle(false);
                    event.preventDefault();
                }
                if (event.code === "ArrowDown" && !isOpen) {
                    onToggle(true);
                    event.preventDefault();
                }
            },
            [isOpen, onToggle, closeOnEscape],
        );

        return (
            <div
                onKeyDown={handleKeyDown}
                className={"gd-dropdown-button-wrapper"}
                {...divProps}
                ref={ref as RefObject<HTMLDivElement>}
            >
                {children}
            </div>
        );
    },
);
