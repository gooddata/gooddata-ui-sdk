// (C) 2025 GoodData Corporation
import { ReactNode, useCallback, useMemo, useState } from "react";
import { getFocusableElements } from "../../utils/domUtilities.js";
import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { focusAndEnsureReachableElement, getNextFocusableElement } from "./utils.js";
import { IUiFocusHelperConnectors, NavigationDirection } from "./types.js";

/**
 * @internal
 */
export const useUiFocusTrapConnectors = <
    T extends HTMLElement = HTMLElement,
>(): IUiFocusHelperConnectors<T> => {
    const [element, setElement] = useState<null | HTMLElement>(null);

    const handleMoveFocus = useCallback(
        (direction: NavigationDirection) => () => {
            const { focusableElements } = getFocusableElements(element);

            focusAndEnsureReachableElement(
                getNextFocusableElement(document.activeElement as HTMLElement, focusableElements, direction),
                focusableElements,
                direction,
            );
        },
        [element],
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
                { shouldPreventDefault: true, shouldStopPropagation: true },
            ),
        [handleMoveFocus],
    );

    return useMemo(() => ({ ref: setElement, onKeyDown: handleKeyDown }), [handleKeyDown]);
};

/**
 * @internal
 */
export function UiFocusTrap({ children }: { children: ReactNode }) {
    const connectors = useUiFocusTrapConnectors<HTMLDivElement>();

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
}
