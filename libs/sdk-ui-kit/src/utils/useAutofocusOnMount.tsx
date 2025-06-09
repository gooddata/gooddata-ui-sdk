// (C) 2025 GoodData Corporation

import React from "react";
import { getFocusableElements, isElementFocusable, isElementTextInput } from "./domUtilities.js";

/**
 * @internal
 */
export interface IAutofocusOptions {
    isDisabled?: boolean;
    refocusKey?: unknown;
}

/**
 * Provides a ref that will autofocus the element when it is mounted, or when `refocusKey` changes.
 *
 * @internal
 */
export const useAutofocusOnMountRef = ({ isDisabled, refocusKey }: IAutofocusOptions = {}) => {
    const [element, setElement] = React.useState<HTMLElement | null>(null);

    useAutofocusOnMount(element, { isDisabled, refocusKey });

    return React.useCallback((node: HTMLElement | null) => {
        setElement(node);
    }, []);
};

/**
 * Focuses the element on mount or when `refocusKey` changes.
 *
 * @internal
 */
export const useAutofocusOnMount = (
    element: HTMLElement | null | undefined,
    { isDisabled, refocusKey }: IAutofocusOptions = {},
) => {
    // If the element is outside of the viewport, calling focus() will not work.
    // This can happen for example with floating elements, that are repositioned after they mount
    React.useEffect(() => {
        const elementToFocus = getElementToFocus(element);

        if (isDisabled || !elementToFocus) {
            return undefined;
        }

        const observer = new IntersectionObserver(([{ target }]) => {
            // Focusing a newly created element sometimes fails if not done through requestAnimationFrame()
            window.requestAnimationFrame(() => {
                if (
                    element.contains(document.activeElement) ||
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
    }, [refocusKey, isDisabled, element]);
};

function getElementToFocus(element: HTMLElement | null | undefined) {
    return isElementFocusable(element) ? element : getFocusableElements(element).firstElement;
}

/**
 * Wrapper that focuses the first focusable child when it mounts, or when `refocusKey` changes.
 *
 * @internal
 */
export const AutofocusOnMount: React.FC<
    {
        children: React.ReactNode;
    } & IAutofocusOptions
> = ({ isDisabled, refocusKey, children }) => {
    const ref = useAutofocusOnMountRef({ isDisabled, refocusKey });

    return (
        <div ref={ref} style={{ display: "contents" }}>
            {children}
        </div>
    );
};
