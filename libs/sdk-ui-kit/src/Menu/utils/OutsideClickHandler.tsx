// (C) 2007-2025 GoodData Corporation

import { ReactNode, useCallback, useEffect, useRef } from "react";

export interface IOutsideClickHandlerProps {
    onOutsideClick: (e: MouseEvent) => void;
    toggler?: HTMLDivElement;
    useCapture?: boolean;
    children?: ReactNode;
}

export function OutsideClickHandler({
    onOutsideClick,
    toggler,
    useCapture = true,
    children,
}: IOutsideClickHandlerProps) {
    // Set to true by default so that a `stopPropagation` in the
    // children will not prevent all outside click handlers from firing

    const wrapperElRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback(
        (e: MouseEvent) => {
            if (!wrapperElRef.current) {
                // In IE11 the wrapperEl is not initialized for some reason.
                return;
            }

            const target = e.target as HTMLElement;

            if (wrapperElRef.current.contains(target) || toggler?.contains(target)) {
                return;
            }

            if (onOutsideClick) {
                onOutsideClick(e);
            }
        },
        [onOutsideClick, toggler],
    );

    const addListeners = useCallback(() => {
        document.addEventListener("mousedown", handleClick, useCapture);
    }, [handleClick, useCapture]);

    const removeListeners = useCallback(() => {
        document.removeEventListener("mousedown", handleClick, useCapture);
    }, [handleClick, useCapture]);

    useEffect(() => {
        addListeners();
        return removeListeners;
    }, [onOutsideClick, useCapture, addListeners, removeListeners]);

    return <div ref={wrapperElRef}>{children}</div>;
}
