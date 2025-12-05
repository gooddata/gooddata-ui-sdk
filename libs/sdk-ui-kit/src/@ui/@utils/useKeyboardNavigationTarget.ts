// (C) 2025 GoodData Corporation

import { useCallback, useRef } from "react";

/**
 * @internal
 */
export interface IUseKeyboardNavigationTargetProps {
    navigationId: string;
    label?: string;
    tabIndex?: number;
    // if provided should be wrapped in useCallback to ensure it is a constant function
    onFocus?: () => void;
}

/**
 * @internal
 */
export const useKeyboardNavigationTarget = ({
    navigationId,
    label,
    tabIndex = -1,
    onFocus,
}: IUseKeyboardNavigationTargetProps) => {
    const elementRef = useRef<HTMLElement>(null);

    const setAttributes = useCallback(() => {
        const ref = elementRef.current;

        if (ref) {
            ref.id = navigationId;
            ref.tabIndex = tabIndex;
            ref.role = "navigation";
            ref.setAttribute("aria-label", label ?? "");
            if (onFocus) {
                ref.addEventListener("focus", onFocus);
                return () => {
                    ref.removeEventListener("focus", onFocus);
                };
            }
        }
        return undefined;
    }, [navigationId, onFocus, tabIndex, label]);
    const targetRef = useCallback(
        (node: HTMLElement | null) => {
            elementRef.current = node;
            if (node) {
                setAttributes();
            }
        },
        [setAttributes],
    );

    return {
        targetRef,
    };
};
