// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import { type UiDrawerTransitionProps } from "../types.js";

const MIN_DELAY = 20;

export function useToggleDrawer(open: boolean, props: UiDrawerTransitionProps, showBackdrop = true) {
    const { easing = "ease-out", delay = 0, duration = 300 } = props ?? {};
    const [isOpen, setIsOpen] = useState(false);
    const [isFullyOpen, setFullyOpen] = useState(false);
    const [view, setView] = useState<"closed" | "open">("closed");
    const currentOpenState = useRef(isOpen);

    const toggleDrawer = useCallback(
        (state: boolean) => {
            currentOpenState.current = state;
            if (state) {
                setIsOpen(true);
                setTimeout(
                    () => {
                        if (!currentOpenState.current) {
                            return;
                        }
                        setView("open");
                        setTimeout(() => {
                            setFullyOpen(true);
                        }, duration);
                    },
                    Math.max(MIN_DELAY, delay),
                );
            } else {
                setFullyOpen(false);
                setTimeout(
                    () => {
                        if (currentOpenState.current) {
                            return;
                        }
                        setView("closed");
                        setTimeout(() => {
                            setIsOpen(false);
                        }, duration);
                    },
                    Math.max(MIN_DELAY, delay),
                );
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

    const contentStyle = {
        transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
    };

    const backdropStyle = {
        ...(showBackdrop
            ? {}
            : {
                  backgroundColor: "transparent",
              }),
        ...contentStyle,
    };

    return {
        isOpen,
        isFullyOpen,
        view,
        contentStyle,
        backdropStyle,
    };
}
