// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useEffect, useRef } from "react";

import { type IRootRef } from "../../../components/ExpandableTooltip.js";
import { destroyMaqlTooltip } from "../../MaqlEditor.tooltip.js";

export function useHoverEvent(
    editorElement: HTMLElement | null,
    tooltip: MutableRefObject<IRootRef | null>,
    isHoverShortcut: (e: KeyboardEvent) => boolean,
): MutableRefObject<MouseEvent | KeyboardEvent | null> {
    const currentEvent = useRef<MouseEvent | KeyboardEvent | null>(null);

    useEffect(() => {
        const handlerEvent = (e: MouseEvent | KeyboardEvent) => {
            // Store the current event for use in hover provider
            currentEvent.current = e;
        };

        const handleKey = (e: KeyboardEvent) => {
            //Do not hide if there is triggered shortcut Ctrl/Cmd + u
            if (isHoverShortcut(e)) {
                return;
            }

            destroyMaqlTooltip(tooltip);
        };

        if (editorElement) {
            editorElement.addEventListener("mousemove", handlerEvent);
            editorElement.addEventListener("keydown", handlerEvent);
            editorElement.addEventListener("keydown", handleKey);
        }

        return () => {
            if (editorElement) {
                editorElement.removeEventListener("mousemove", handlerEvent);
                editorElement.removeEventListener("keydown", handlerEvent);
                editorElement.removeEventListener("keydown", handleKey);
            }
        };
    }, [editorElement, tooltip, isHoverShortcut]);

    return currentEvent;
}
