// (C) 2025 GoodData Corporation

import React from "react";

import { IUiFocusHelperConnectors } from "./types.js";
import { resolveRef } from "./utils.js";
import { getFocusableElements, isElementFocusable, isElementTextInput } from "../../utils/domUtilities.js";

/**
 * @internal
 */
export interface IUiAutofocusOptions {
    refocusKey?: unknown;
    initialFocus?: string | React.RefObject<HTMLElement>;
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
    const [element, setElement] = React.useState<HTMLElement | null>(null);

    // If the element is outside of the viewport, calling focus() will not work.
    // This can happen for example with floating elements, that are repositioned after they mount
    React.useEffect(() => {
        const elementToFocus = getElementToFocus(element, initialFocus, true);

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

    return React.useMemo(() => ({ ref: setElement }), []);
};

function getElementToFocus(
    element: HTMLElement | null | undefined,
    initialFocus?: string | React.RefObject<HTMLElement>,
    includeHidden?: boolean,
) {
    const initialFocusElement = resolveRef(initialFocus);
    const elementToCheck = initialFocusElement ?? element;

    return isElementFocusable(elementToCheck, includeHidden)
        ? elementToCheck
        : getFocusableElements(elementToCheck, includeHidden).firstElement;
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
    children: React.ReactNode;
} & IUiAutofocusOptions) {
    const connectors = useUiAutofocusConnectors<HTMLDivElement>(options);

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
}
