// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useEffect, useRef } from "react";

import { type IInputPureHandle } from "@gooddata/sdk-ui-kit";

export function useFocus(component: HTMLElement | IInputPureHandle | null, focus: boolean): void {
    const timer = useRef<number>(-1);
    const element = getElement(component);

    useEffect(() => {
        clearInterval(timer);
        if (element && component && focus) {
            createInterval(
                timer,
                () => isVisible(element),
                () => component.focus(),
            );
        }

        return () => {
            clearInterval(timer);
        };
    }, [component, focus, element]);
}

function isVisible(element: HTMLElement | null) {
    if (element && typeof window !== "undefined") {
        try {
            const style = window.getComputedStyle(element);
            const notHidden = style.visibility !== "hidden";
            const notNone = style.display !== "none";
            const hasSize = element.offsetHeight > 0;

            return notHidden && notNone && hasSize;
        } catch {
            // If getComputedStyle fails (e.g., during test teardown), consider element not visible
            return false;
        }
    }
    return false;
}

function getElement(component: HTMLElement | IInputPureHandle | null): HTMLElement | null {
    if (component === null) {
        return null;
    }
    if ("inputNodeRef" in component) {
        return component.inputNodeRef || null;
    }
    return component;
}

function clearInterval(timer: MutableRefObject<number>) {
    if (typeof window !== "undefined") {
        window.clearInterval(timer.current);
    }
}

function createInterval(timer: MutableRefObject<number>, check: () => boolean, done: () => void) {
    if (typeof window !== "undefined") {
        timer.current = window.setInterval(() => {
            if (check()) {
                done();
                clearInterval(timer);
            }
        }, 25);
    }
}
