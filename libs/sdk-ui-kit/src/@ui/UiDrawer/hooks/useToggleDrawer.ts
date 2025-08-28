// (C) 2025 GoodData Corporation
import { useCallback, useEffect, useRef, useState } from "react";

import { UiDrawerTransitionProps } from "../types.js";

export function useToggleDrawer(open: boolean, props: UiDrawerTransitionProps) {
    const { easing = "ease-in-out", delay = 0, duration = 150 } = props ?? {};
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"closed" | "open">("closed");
    const currentOpenState = useRef(isOpen);

    const toggleDrawer = useCallback(
        (state: boolean) => {
            currentOpenState.current = state;
            if (state) {
                setIsOpen(true);
                setTimeout(() => {
                    if (!currentOpenState.current) {
                        return;
                    }
                    requestAnimationFrame(() => {
                        setView("open");
                    });
                }, delay);
            } else {
                setTimeout(() => {
                    if (currentOpenState.current) {
                        return;
                    }
                    setView("closed");
                    setTimeout(() => {
                        setIsOpen(false);
                    }, duration);
                }, delay);
            }
        },
        [delay, duration],
    );

    useEffect(() => {
        if (isOpen === open) {
            return;
        }
        toggleDrawer(open);
    }, [open, isOpen, toggleDrawer]);

    const style = {
        transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
    };

    return {
        isOpen,
        view,
        style,
    };
}
