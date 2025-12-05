// (C) 2025 GoodData Corporation

import { ReactElement, ReactNode, cloneElement, useCallback, useMemo, useState } from "react";

import { IUiFocusHelperConnectors } from "./types.js";
import { focusAndEnsureReachableElement, getNextFocusableElement } from "./utils.js";
import { NavigationDirection } from "../../typings/navigation.js";
import { getFocusableElements } from "../../utils/domUtilities.js";
import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";

/**
 * @internal
 */
export const useUiFocusTrapConnectors = <T extends HTMLElement = HTMLElement>(
    focusCheckFn: (element: HTMLElement) => boolean,
): IUiFocusHelperConnectors<T> => {
    const [element, setElement] = useState<null | HTMLElement>(null);

    const handleMoveFocus = useCallback(
        (direction: NavigationDirection) => () => {
            const { focusableElements } = getFocusableElements(element);

            focusAndEnsureReachableElement(
                getNextFocusableElement(document.activeElement as HTMLElement, focusableElements, direction),
                focusableElements,
                direction,
                focusCheckFn,
            );
        },
        [element, focusCheckFn],
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
export function UiFocusTrap({
    root,
    children,
    focusCheckFn,
}: {
    root?: ReactElement;
    children: ReactNode;
    focusCheckFn?: (element: HTMLElement) => boolean;
}) {
    const rootElement = root || <div className="gd-focus-trap" style={{ display: "contents" }} />;
    const connectors = useUiFocusTrapConnectors<HTMLDivElement>(focusCheckFn ?? (() => true));

    return cloneElement(rootElement, { ...rootElement.props, ...connectors }, children);
}
