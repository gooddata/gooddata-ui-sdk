// (C) 2025 GoodData Corporation
import React from "react";
import { resolveRef } from "./utils.js";
import { IUiFocusHelperConnectors } from "./types.js";

/**
 * @internal
 */
export interface IUiReturnFocusOnUnmountOptions {
    returnFocusTo?: string | React.RefObject<HTMLElement>;
}

/**
 * @internal
 */
export const UiReturnFocusOnUnmount: React.FC<
    IUiReturnFocusOnUnmountOptions & { children: React.ReactNode }
> = ({ children, ...options }) => {
    const connectors = useUiReturnFocusOnUnmountConnectors<HTMLDivElement>(options);

    return (
        <div style={{ display: "contents" }} {...connectors}>
            {children}
        </div>
    );
};

/**
 * @internal
 */
export const useUiReturnFocusOnUnmountConnectors = <T extends HTMLElement = HTMLElement>({
    returnFocusTo,
}: IUiReturnFocusOnUnmountOptions = {}): IUiFocusHelperConnectors<T> => {
    const returnFocusRef = React.useRef<HTMLElement | null>(null);
    React.useEffect(() => {
        returnFocusRef.current = resolveRef(returnFocusTo) ?? (document.activeElement as HTMLElement);
    }, [returnFocusTo]);

    const hasMountedRef = React.useRef(false);

    const ref = React.useCallback((element: HTMLElement | null) => {
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

    return React.useMemo(() => ({ ref }), [ref]);
};
