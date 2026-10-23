// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useEffect, useRef } from "react";

import type { IStandaloneCodeEditor } from "../MonacoEditor.js";

export function useAutofocus(
    element: HTMLDivElement | null,
    editor: IStandaloneCodeEditor | null,
    autofocus: boolean,
): void {
    const timer = useRef<number>(-1);

    useEffect(() => {
        clearInterval(timer);

        if (editor && autofocus) {
            createInterval(
                timer,
                () => isVisible(element),
                () => editor.focus(),
            );
        }

        return () => clearInterval(timer);
    }, [editor, autofocus, element]);
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

function createInterval(timer: MutableRefObject<number>, check: () => boolean, done: () => void) {
    timer.current = window.setInterval(() => {
        if (check()) {
            done();
            clearInterval(timer);
        }
    }, 25);
}
