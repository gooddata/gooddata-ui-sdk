// (C) 2025 GoodData Corporation

import { KeyboardEvent, ReactNode, useCallback, useMemo, useState } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { IUiFocusHelperConnectors } from "./types.js";
import { NavigationDirection } from "../../typings/navigation.js";
import { getFocusableElements } from "../../utils/domUtilities.js";
import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";

/**
 * @internal
 */
export function UiTabOutHandler({ onTabOut, children }: { onTabOut: () => void; children: ReactNode }) {
    const connectors = useUiTabOutHandlerConnectors<HTMLDivElement>(onTabOut);

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
}

/**
 * @internal
 */
export const useUiTabOutHandlerConnectors = <T extends HTMLElement = HTMLElement>(
    handler?: (event: KeyboardEvent) => void,
): IUiFocusHelperConnectors<T> => {
    const [element, setElement] = useState<null | HTMLElement>(null);

    const handlerRef = useAutoupdateRef(handler);

    const handleMoveFocus = useCallback(
        (direction: NavigationDirection) => (event: KeyboardEvent) => {
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

    const handleKeyDown = useMemo(
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

    return useMemo(() => ({ ref: setElement, onKeyDown: handleKeyDown }), [handleKeyDown]);
};
