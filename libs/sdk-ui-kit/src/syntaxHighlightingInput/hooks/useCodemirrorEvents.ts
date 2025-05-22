// (C) 2025 GoodData Corporation
import { EditorView } from "@codemirror/view";
import { completionStatus } from "@codemirror/autocomplete";

export function useCodemirrorEvents() {
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
    });

    return {
        domEventsExtension,
    };
}
