// (C) 2025 GoodData Corporation

import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { IUiFocusHelperConnectors } from "./types.js";
import { resolveRef } from "./utils.js";

/**
 * @internal
 */
export interface IUiReturnFocusOnUnmountOptions {
    returnFocusTo?: string | RefObject<HTMLElement>;
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
    const returnFocusRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        returnFocusRef.current = resolveRef(returnFocusTo) ?? (document.activeElement as HTMLElement);
    }, [returnFocusTo]);

    const hasMountedRef = useRef(false);

    const ref = useCallback((element: HTMLElement | null) => {
        if (element) {
            hasMountedRef.current = true;
            return;
        }

        const elementToFocus = resolveRef(returnFocusRef);

        if (!hasMountedRef.current || !elementToFocus) {
            return;
        }

        elementToFocus.focus();
        hasMountedRef.current = false;
    }, []);

    return useMemo(() => ({ ref }), [ref]);
};
