// (C) 2025 GoodData Corporation

import { type ReactNode, type RefObject, useCallback, useMemo, useRef } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { type IUiFocusHelperConnectors } from "./types.js";
import { resolveRef } from "./utils.js";

/**
 * @internal
 */
export interface IUiReturnFocusOnUnmountOptions {
    returnFocusTo?: string | RefObject<HTMLElement | null> | (() => HTMLElement | null);
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
}: IUiReturnFocusOnUnmountOptions = {}): IUiFocusHelperConnectors<T> => {
    const originalFocusRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement);
    const returnFocusToRef = useAutoupdateRef(returnFocusTo);

    const hasMountedRef = useRef(false);

    const ref = useCallback(
        (element: HTMLElement | null) => {
            if (element) {
                hasMountedRef.current = true;
                return;
            }

            const elementToFocus = resolveRef(returnFocusToRef.current) ?? originalFocusRef.current;

            if (!hasMountedRef.current || !elementToFocus) {
                return;
            }

            elementToFocus.focus();
            hasMountedRef.current = false;
        },
        [returnFocusToRef],
    );

    return useMemo(() => ({ ref }), [ref]);
};
