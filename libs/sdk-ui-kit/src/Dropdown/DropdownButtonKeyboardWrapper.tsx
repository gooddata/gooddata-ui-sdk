// (C) 2025-2026 GoodData Corporation

import { type HTMLProps, type KeyboardEventHandler, type RefObject, forwardRef, useCallback } from "react";

import { isElementTextInput } from "../utils/domUtilities.js";

type IDropdownButtonKeyboardWrapperProps = {
    enabled?: boolean;
    onToggle: (desiredState?: unknown) => void;
    closeOnEscape?: boolean;
    isOpen: boolean;
} & HTMLProps<HTMLDivElement>;

export const DropdownButtonKeyboardWrapper = forwardRef<HTMLElement, IDropdownButtonKeyboardWrapperProps>(
    function DropdownButtonKeyboardWrapper(
        { onToggle, isOpen, closeOnEscape = true, children, enabled = true, ...divProps },
        ref,
    ) {
        const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
            (event) => {
                const isInputFocused = isElementTextInput(document.activeElement);

                if (!enabled) {
                    return;
                }

                if (event.code === "Enter" || (event.code === "Space" && !isInputFocused)) {
                    onToggle();
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (event.code === "Escape" && isOpen && closeOnEscape) {
                    onToggle(false);
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (event.code === "ArrowUp" && isOpen) {
                    onToggle(false);
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (event.code === "ArrowDown" && !isOpen) {
                    onToggle(true);
                    event.preventDefault();
                    event.stopPropagation();
                }
            },
            [isOpen, onToggle, closeOnEscape, enabled],
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
