// (C) 2025 GoodData Corporation
import { MutableRefObject, useMemo } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";

export function useCodemirrorKeymap({
    handleKeyDown,
}: {
    handleKeyDown: MutableRefObject<(event: KeyboardEvent, view: EditorView) => boolean>;
}) {
    // Keymap extension
    const keymapExtension = useMemo(() => {
        return keymap.of([
            {
                any(view, event) {
                    return handleKeyDown.current?.(event, view) ?? false;
                },
            },
            ...defaultKeymap,
            ...historyKeymap,
        ]);
    }, [handleKeyDown]);

    return { keymapExtension };
}
