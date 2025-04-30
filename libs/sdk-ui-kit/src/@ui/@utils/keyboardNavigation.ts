// (C) 2025 GoodData Corporation

interface IHandleActionProps {
    shouldPreventDefault?: boolean;
    shouldStopPropagation?: boolean;
}

const handleAction = <T extends React.KeyboardEvent | KeyboardEvent = React.KeyboardEvent>(
    event: T,
    action?: (e: T) => void,
    { shouldPreventDefault = true, shouldStopPropagation = true }: IHandleActionProps = {},
) => {
    if (!action) {
        return;
    }

    if (shouldPreventDefault) {
        event.preventDefault();
    }
    if (shouldStopPropagation) {
        event.stopPropagation();
    }

    action(event);
};

const handleActionEvent = <T extends React.KeyboardEvent | KeyboardEvent = React.KeyboardEvent>(
    event: T,
    shouldPreventDefault,
    shouldStopPropagation,
): ((action?: (e: T) => void) => void) => {
    return (action?: (e: T) => void) => {
        handleAction(event, action, { shouldPreventDefault, shouldStopPropagation });
    };
};

/**
 * @internal
 */
export const makeMenuKeyboardNavigation = <
    T extends React.KeyboardEvent | KeyboardEvent = React.KeyboardEvent,
>({
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
        const handleAction = handleActionEvent(event, shouldPreventDefault, shouldStopPropagation);
        switch (event.code) {
            case "ArrowDown":
                handleAction(onFocusNext);
                break;
            case "ArrowUp":
                handleAction(onFocusPrevious);
                break;
            case "ArrowLeft":
                handleAction(onLeaveLevel);
                break;
            case "ArrowRight":
                handleAction(onEnterLevel);
                break;
            case "Home":
                handleAction(onFocusFirst);
                break;
            case "End":
                handleAction(onFocusLast);
                break;
            case "Enter":
            case "Space":
                handleAction(onSelect);
                break;
            case "Escape":
                handleAction(onClose);
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
export const makeDialogKeyboardNavigation = <
    T extends React.KeyboardEvent | KeyboardEvent = React.KeyboardEvent,
>({
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
                    handleAction(event, onFocusPrevious, {
                        shouldPreventDefault,
                        shouldStopPropagation,
                    });
                } else {
                    handleAction(event, onFocusNext, {
                        shouldPreventDefault,
                        shouldStopPropagation,
                    });
                }
                break;
            case "Escape":
                handleAction(event, onClose, {
                    shouldPreventDefault,
                    shouldStopPropagation,
                });
                break;
            default:
                onUnhandledKeyDown?.(event);
                break;
        }
    };
};
