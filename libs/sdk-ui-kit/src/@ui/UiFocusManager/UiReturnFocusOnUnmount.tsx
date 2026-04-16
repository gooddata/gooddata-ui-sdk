// (C) 2025-2026 GoodData Corporation

import { type ReactNode, type RefObject, useCallback, useMemo, useRef } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { type IUiFocusHelperConnectors } from "./types.js";
import { resolveRef } from "./utils.js";
import { getFocusableElements, isElementFocusable } from "../../utils/domUtilities.js";

/**
 * @internal
 */
export interface IUiReturnFocusOnUnmountOptions {
    returnFocusTo?: string | RefObject<HTMLElement | null> | (() => HTMLElement | null);
    focusVisible?: boolean;
}

/**
 * @internal
 */
export function UiReturnFocusOnUnmount({
    children,
    ...options
}: IUiReturnFocusOnUnmountOptions & { children: ReactNode }) {
    const connectors = useUiReturnFocusOnUnmountConnectors<HTMLDivElement>(options);

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
}

/**
 * @internal
 */
export const useUiReturnFocusOnUnmountConnectors = <T extends HTMLElement = HTMLElement>({
    returnFocusTo,
    focusVisible,
}: IUiReturnFocusOnUnmountOptions = {}): IUiFocusHelperConnectors<T> => {
    const originalFocusRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement);
    const returnFocusToRef = useAutoupdateRef(returnFocusTo);
    const focusVisibleRef = useAutoupdateRef(focusVisible);

    const hasMountedRef = useRef(false);

    const ref = useCallback(
        (element: HTMLElement | null) => {
            if (element) {
                hasMountedRef.current = true;
                return;
            }

            if (!hasMountedRef.current) {
                return;
            }

            hasMountedRef.current = false;

            const generalElementToFocus = resolveRef(returnFocusToRef.current) ?? originalFocusRef.current;
            const focusableElement = isElementFocusable(generalElementToFocus)
                ? generalElementToFocus
                : getFocusableElements(generalElementToFocus).firstElement;

            if (!focusableElement) {
                return;
            }

            // Defer the focus call to a microtask so that it runs after React's commit phase completes.
            // This avoids triggering state updates (and act() warnings) during React's commit phase.
            // The focus still happens before the next paint.
            queueMicrotask(() => {
                // Only return focus if it was truly lost (e.g., moved to <body> because the
                // focused element was removed from the DOM). If the user already clicked on
                // another element, don't steal focus from it.
                if (document.activeElement && document.activeElement !== document.body) {
                    return;
                }

                // @ts-expect-error focusVisible property is defined in FocusOptions in higher TypeScript versions
                focusableElement.focus({ focusVisible: focusVisibleRef.current });
            });
        },
        [returnFocusToRef, focusVisibleRef],
    );

    return useMemo(() => ({ ref }), [ref]);
};
