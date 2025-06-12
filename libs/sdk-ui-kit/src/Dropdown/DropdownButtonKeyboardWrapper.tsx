// (C) 2025 GoodData Corporation
import React from "react";
import { isElementTextInput } from "../utils/domUtilities.js";

type IDropdownButtonKeyboardWrapperProps = {
    onToggle: (desiredState?: boolean | unknown) => void;
    isOpen: boolean;
} & React.HTMLProps<HTMLDivElement>;

export const DropdownButtonKeyboardWrapper = React.forwardRef<
    HTMLElement,
    IDropdownButtonKeyboardWrapperProps
>(function DropdownButtonKeyboardWrapper({ onToggle, isOpen, children, ...divProps }, ref) {
    const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
        (event) => {
            const isInputFocused = isElementTextInput(document.activeElement);

            if (event.code === "Enter" || (event.code === "Space" && !isInputFocused)) {
                onToggle();
                event.preventDefault();
            }
            if ((event.code === "Escape" || event.code === "ArrowUp") && isOpen) {
                onToggle(false);
                event.preventDefault();
            }
            if (event.code === "ArrowDown" && !isOpen) {
                onToggle(true);
                event.preventDefault();
            }
        },
        [isOpen, onToggle],
    );

    return (
        <div
            onKeyDown={handleKeyDown}
            className={"gd-dropdown-button-wrapper"}
            {...divProps}
            ref={ref as React.RefObject<HTMLDivElement>}
        >
            {children}
        </div>
    );
});
