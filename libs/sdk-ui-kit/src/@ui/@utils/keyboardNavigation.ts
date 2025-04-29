// (C) 2025 GoodData Corporation

const handleAction = <T extends React.KeyboardEvent | KeyboardEvent>(
    event: T,
    action?: (e: T) => void,
    shouldPreventDefault = true,
    shouldStopPropagation = true,
) => {
    if (!action) {
        return;
    }

    shouldPreventDefault && event.preventDefault();
    shouldStopPropagation && event.stopPropagation();

    action(event);
};

/**
 * @internal
 */
export const makeMenuKeyboardNavigation = <T extends React.KeyboardEvent | KeyboardEvent>({
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
    onFocusNext?: (event: T) => void;
    onFocusPrevious?: (event: T) => void;
    onFocusFirst?: (event: T) => void;
    onFocusLast?: (event: T) => void;
    onEnterLevel?: (event: T) => void;
    onLeaveLevel?: (event: T) => void;
    onSelect?: (event: T) => void;
    onClose?: (event: T) => void;
    onUnhandledKeyDown?: (event: T) => void;

    shouldPreventDefault?: boolean;
    shouldStopPropagation?: boolean;
}) => {
    return (event: T) => {
        switch (event.code) {
            case "ArrowDown":
                handleAction(event, onFocusNext, shouldPreventDefault, shouldStopPropagation);
                break;
            case "ArrowUp":
                handleAction(event, onFocusPrevious, shouldPreventDefault, shouldStopPropagation);
                break;
            case "ArrowLeft":
                handleAction(event, onLeaveLevel, shouldPreventDefault, shouldStopPropagation);
                break;
            case "ArrowRight":
                handleAction(event, onEnterLevel, shouldPreventDefault, shouldStopPropagation);
                break;
            case "Home":
                handleAction(event, onFocusFirst, shouldPreventDefault, shouldStopPropagation);
                break;
            case "End":
                handleAction(event, onFocusLast, shouldPreventDefault, shouldStopPropagation);
                break;
            case "Enter":
            case "Space":
                handleAction(event, onSelect, shouldPreventDefault, shouldStopPropagation);
                break;
            case "Escape":
                handleAction(event, onClose, shouldPreventDefault, shouldStopPropagation);
                break;
            default:
                onUnhandledKeyDown?.(event);
                break;
        }
    };
};

/**
 * @internal
 */
export const makeDialogKeyboardNavigation = <T extends React.KeyboardEvent | KeyboardEvent>({
    onFocusPrevious,
    onFocusNext,
    onClose,
    onUnhandledKeyDown,

    shouldPreventDefault = true,
    shouldStopPropagation = true,
}: {
    onFocusNext?: (event: T) => void;
    onFocusPrevious?: (event: T) => void;
    onClose?: (event: T) => void;
    onUnhandledKeyDown?: (event: T) => void;

    shouldPreventDefault?: boolean;
    shouldStopPropagation?: boolean;
}) => {
    return (event: T) => {
        switch (event.code) {
            case "Tab":
                if (event.shiftKey) {
                    handleAction(event, onFocusPrevious, shouldPreventDefault, shouldStopPropagation);
                } else {
                    handleAction(event, onFocusNext, shouldPreventDefault, shouldStopPropagation);
                }
                break;
            case "Escape":
                handleAction(event, onClose, shouldPreventDefault, shouldStopPropagation);
                break;
            default:
                onUnhandledKeyDown?.(event);
                break;
        }
    };
};
