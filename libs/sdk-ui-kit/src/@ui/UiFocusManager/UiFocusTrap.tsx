// (C) 2025 GoodData Corporation
import * as React from "react";
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
    const [element, setElement] = React.useState<null | HTMLElement>(null);

    const handleMoveFocus = React.useCallback(
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
                { shouldPreventDefault: true, shouldStopPropagation: true },
            ),
        [handleMoveFocus],
    );

    return React.useMemo(() => ({ ref: setElement, onKeyDown: handleKeyDown }), [handleKeyDown]);
};

/**
 * @internal
 */
export const UiFocusTrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const connectors = useUiFocusTrapConnectors<HTMLDivElement>();

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
};
