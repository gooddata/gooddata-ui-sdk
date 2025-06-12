// (C) 2025 GoodData Corporation
import { EditorView } from "@codemirror/view";
import { completionStatus } from "@codemirror/autocomplete";
import { MutableRefObject } from "react";

export function useCodemirrorEvents({
    handleFocus,
    handleBlur,
}: {
    handleFocus: MutableRefObject<(event: FocusEvent, view: EditorView) => void>;
    handleBlur: MutableRefObject<(event: FocusEvent, view: EditorView) => void>;
}) {
    // Dom events handlers
    const domEventsExtension = EditorView.domEventHandlers({
        keydown(event, view) {
            if (event.key === "Escape") {
                const open = completionStatus(view.state);
                if (open) {
                    event.stopPropagation();
                }
            }
        },
        focus(event, view) {
            handleFocus.current?.(event, view);
        },
        blur(event, view) {
            handleBlur.current?.(event, view);
        },
    });

    return {
        domEventsExtension,
    };
}
