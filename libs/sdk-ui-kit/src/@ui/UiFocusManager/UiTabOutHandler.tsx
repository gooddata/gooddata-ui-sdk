// (C) 2025 GoodData Corporation
import * as React from "react";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { getFocusableElements } from "../../utils/domUtilities.js";
import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { IUiFocusHelperConnectors, NavigationDirection } from "./types.js";

/**
 * @internal
 */
export const UiTabOutHandler: React.FC<{ onTabOut: () => void; children: React.ReactNode }> = ({
    onTabOut,
    children,
}) => {
    const connectors = useUiTabOutHandlerConnectors<HTMLDivElement>(onTabOut);

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
};

/**
 * @internal
 */
export const useUiTabOutHandlerConnectors = <T extends HTMLElement = HTMLElement>(
    handler?: (event: React.KeyboardEvent) => void,
): IUiFocusHelperConnectors<T> => {
    const [element, setElement] = React.useState<null | HTMLElement>(null);

    const handlerRef = useAutoupdateRef(handler);

    const handleMoveFocus = React.useCallback(
        (direction: NavigationDirection) => (event: React.KeyboardEvent) => {
            const { firstElement, lastElement } = getFocusableElements(element);

            if (
                (direction === "forward" && document.activeElement === lastElement) ||
                (direction === "backward" && document.activeElement === firstElement)
            ) {
                handlerRef.current?.(event);
            }
        },
        [element, handlerRef],
    );

    const handleKeyDown = React.useMemo(
        () =>
            makeKeyboardNavigation({
                onFocusNext: [{ code: "Tab", modifiers: ["!Shift"] }],
                onFocusPrevious: [{ code: "Tab", modifiers: ["Shift"] }],
            })(
                {
                    onFocusNext: handleMoveFocus("forward"),
                    onFocusPrevious: handleMoveFocus("backward"),
                },
                { shouldPreventDefault: false, shouldStopPropagation: false },
            ),
        [handleMoveFocus],
    );

    return React.useMemo(() => ({ ref: setElement, onKeyDown: handleKeyDown }), [handleKeyDown]);
};
