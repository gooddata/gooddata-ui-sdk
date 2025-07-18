// (C) 2025 GoodData Corporation

import { RefObject, ReactNode, useState, useEffect, useMemo } from "react";
import { getFocusableElements, isElementFocusable, isElementTextInput } from "../../utils/domUtilities.js";
import { resolveRef } from "./utils.js";
import { IUiFocusHelperConnectors } from "./types.js";

/**
 * @internal
 */
export interface IUiAutofocusOptions {
    refocusKey?: unknown;
    initialFocus?: string | RefObject<HTMLElement>;
}

/**
 * Provides a ref that will autofocus the element when it is mounted, or when `refocusKey` changes.
 *
 * @internal
 */
export const useUiAutofocusConnectors = <T extends HTMLElement = HTMLElement>({
    refocusKey,
    initialFocus,
}: IUiAutofocusOptions = {}): IUiFocusHelperConnectors<T> => {
    const [element, setElement] = useState<HTMLElement | null>(null);

    // If the element is outside of the viewport, calling focus() will not work.
    // This can happen for example with floating elements, that are repositioned after they mount
    useEffect(() => {
        const elementToFocus = getElementToFocus(element, initialFocus);

        if (!elementToFocus) {
            return undefined;
        }

        const observer = new IntersectionObserver(([{ target }]) => {
            // Focusing a newly created element sometimes fails if not done through requestAnimationFrame()
            window.requestAnimationFrame(() => {
                if (
                    element?.contains(document.activeElement) ||
                    target.contains(document.activeElement) ||
                    isElementTextInput(document.activeElement)
                ) {
                    observer.disconnect();
                    return;
                }

                (target as HTMLElement).focus();

                if (document.activeElement === target) {
                    observer.disconnect();
                }
            });
        });

        observer.observe(elementToFocus);

        return () => observer.disconnect();
    }, [refocusKey, element, initialFocus]);

    return useMemo(() => ({ ref: setElement }), []);
};

function getElementToFocus(
    element: HTMLElement | null | undefined,
    initialFocus?: string | RefObject<HTMLElement>,
) {
    const initialFocusElement = resolveRef(initialFocus);
    const elementToCheck = initialFocusElement ?? element;

    return isElementFocusable(elementToCheck)
        ? elementToCheck
        : getFocusableElements(elementToCheck).firstElement;
}

/**
 * Wrapper that focuses the first focusable child when it mounts, or when `refocusKey` changes.
 *
 * @internal
 */
export function UiAutofocus({
    children,
    ...options
}: {
    children: ReactNode;
} & IUiAutofocusOptions) {
    const connectors = useUiAutofocusConnectors<HTMLDivElement>(options);

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
}
