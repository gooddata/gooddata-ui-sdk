// (C) 2025-2026 GoodData Corporation

import { type ReactNode, type RefObject, useCallback, useMemo, useRef } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { getFocusableElements, isElementFocusable } from "../../utils/domUtilities.js";

import { type IUiFocusHelperConnectors } from "./types.js";
import { resolveRef } from "./utils.js";

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

                // TODO: @martinnaj, cleanup ignores after bumping `typescript` dep to next major.
                //  We cannot replace @ts-ignore with @ts-expect-error. Why: we cannot upgrade
                //  `typescript` to later major than 5. This is because the 4-major-behind version
                //  of `react-intl` that we have declares a peerDependency for `typescript@5`. The
                //  next version of `react-intl` drops support for `react@18`, and the bad
                //  peerDependency is removed in a minor, 2 majors after the drop of `react@18`.
                //  This is waiting on SDK major v12, which will drop support for `react@18`.
                // oxlint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore focusVisible property is defined in FocusOptions in higher TypeScript versions
                focusableElement.focus({ focusVisible: focusVisibleRef.current });
            });
        },
        [returnFocusToRef, focusVisibleRef],
    );

    return useMemo(() => ({ ref }), [ref]);
};
