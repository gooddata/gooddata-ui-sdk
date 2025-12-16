// (C) 2025 GoodData Corporation

import { type RefObject, useEffect } from "react";

import { type ReferenceType } from "@floating-ui/react";

import { isClickOnIgnoredElement } from "../UiFloatingElement/utils.js";

// Stable empty array to avoid re-creating on every render
const EMPTY_IGNORE_CLICKS_ON: Array<string | HTMLElement> = [];

/**
 * Data attribute to identify elements that should not trigger outside click closure.
 *
 * @internal
 */
export const FLOATING_ELEMENT_DATA_ATTR = "data-gd-floating-element";

/**
 * @internal
 */
export interface IUseCloseOnOutsideClickOptions {
    floatingRef: RefObject<HTMLElement | null>;
    anchorRef: RefObject<ReferenceType | null>;
    ignoreClicksOn?: Array<string | HTMLElement>;
    shouldCloseOnClick?: (event: Event) => boolean;
}

/**
 * Hook to trigger a callback when clicking outside of a target element.
 *
 * @internal
 */
export function useCloseOnOutsideClick(
    isOpen: boolean,
    onClose: () => void,
    options: IUseCloseOnOutsideClickOptions,
): void {
    const { floatingRef, anchorRef, ignoreClicksOn = EMPTY_IGNORE_CLICKS_ON, shouldCloseOnClick } = options;

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleClick = (event: MouseEvent) => {
            const target = event.target as Element;

            if (floatingRef.current?.contains(target)) {
                return;
            }

            if (anchorRef.current instanceof Element && anchorRef.current.contains(target)) {
                return;
            }

            if (target.closest(`[${FLOATING_ELEMENT_DATA_ATTR}]`)) {
                return;
            }

            if (isClickOnIgnoredElement(target, ignoreClicksOn)) {
                return;
            }

            if (shouldCloseOnClick && !shouldCloseOnClick(event)) {
                return;
            }

            onClose();
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [isOpen, onClose, floatingRef, anchorRef, ignoreClicksOn, shouldCloseOnClick]);
}
