// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useEffect, useRef } from "react";

import { type EditorView } from "@codemirror/view";

/**
 * Focuses the editor once it is visible. The editor may mount inside a dialog that is still
 * animating in (an overlay stays hidden until it is aligned), so the focus waits until the element
 * has a size. The wait ends as soon as something else takes the focus, such as a confirmation
 * dialog opened over the editor, or the user moving on: the editor never takes it back from them.
 */
export function useAutofocus(
    element: HTMLElement | null,
    editor: EditorView | null,
    autofocus: boolean,
): void {
    const timer = useRef<number>(-1);

    useEffect(() => {
        clearInterval(timer);

        if (editor && autofocus) {
            const focusedBefore = document.activeElement;

            createInterval(
                timer,
                () => isFocusTakenElsewhere(element, focusedBefore),
                () => isVisible(element),
                () => editor.focus(),
            );
        }

        return () => clearInterval(timer);
    }, [editor, autofocus, element]);
}

/**
 * Whether the focus has moved to something other than what had it when the editor asked for it
 * (often the control that opened the editor), the editor itself, or the page body (where it falls
 * when the focused element goes away).
 */
function isFocusTakenElsewhere(element: HTMLElement | null, focusedBefore: Element | null) {
    const focused = document.activeElement;

    if (!focused || focused === document.body || focused === focusedBefore) {
        return false;
    }

    return !element?.contains(focused);
}

function isVisible(element: HTMLElement | null) {
    if (element) {
        const style = window.getComputedStyle(element);
        const notHidden = style.visibility !== "hidden";
        const notNone = style.display !== "none";
        const hasSize = element.offsetHeight > 0;

        return notHidden && notNone && hasSize;
    }
    return false;
}

function clearInterval(timer: MutableRefObject<number>) {
    window.clearInterval(timer.current);
}

function createInterval(
    timer: MutableRefObject<number>,
    cancel: () => boolean,
    check: () => boolean,
    done: () => void,
) {
    timer.current = window.setInterval(() => {
        if (cancel()) {
            clearInterval(timer);
        } else if (check()) {
            done();
            clearInterval(timer);
        }
    }, 25);
}
