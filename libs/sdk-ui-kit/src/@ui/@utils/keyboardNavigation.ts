// (C) 2025 GoodData Corporation

import React from "react";

/**
 * @internal
 */
export const makeMenuKeyboardNavigation = ({
    onFocusPrevious,
    onFocusNext,
    onFocusFirst,
    onFocusLast,
    onEnterLevel,
    onLeaveLevel,
    onSelect,
    onClose,
    onUnhandledKeyDown,

    shouldPreventDefault = true,
    shouldStopPropagation = true,
}: {
    onFocusNext?: (event: React.KeyboardEvent) => void;
    onFocusPrevious?: (event: React.KeyboardEvent) => void;
    onFocusFirst?: (event: React.KeyboardEvent) => void;
    onFocusLast?: (event: React.KeyboardEvent) => void;
    onEnterLevel?: (event: React.KeyboardEvent) => void;
    onLeaveLevel?: (event: React.KeyboardEvent) => void;
    onSelect?: (event: React.KeyboardEvent) => void;
    onClose?: (event: React.KeyboardEvent) => void;
    onUnhandledKeyDown?: (event: React.KeyboardEvent) => void;

    shouldPreventDefault?: boolean;
    shouldStopPropagation?: boolean;
}) => {
    function handleAction(event: React.KeyboardEvent, action?: (e: React.KeyboardEvent) => void) {
        if (!action) {
            return;
        }

        shouldPreventDefault && event.preventDefault();
        shouldStopPropagation && event.stopPropagation();

        action(event);
    }

    return (event: React.KeyboardEvent) => {
        switch (event.code) {
            case "ArrowDown":
                handleAction(event, onFocusNext);
                break;
            case "ArrowUp":
                handleAction(event, onFocusPrevious);
                break;
            case "ArrowLeft":
                handleAction(event, onLeaveLevel);
                break;
            case "ArrowRight":
                handleAction(event, onEnterLevel);
                break;
            case "Home":
                handleAction(event, onFocusFirst);
                break;
            case "End":
                handleAction(event, onFocusLast);
                break;
            case "Enter":
            case "Space":
                handleAction(event, onSelect);
                break;
            case "Escape":
                handleAction(event, onClose);
                break;
            default:
                onUnhandledKeyDown?.(event);
                break;
        }
    };
};
