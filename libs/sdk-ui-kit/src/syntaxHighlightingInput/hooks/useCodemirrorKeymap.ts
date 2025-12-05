// (C) 2025 GoodData Corporation

import { RefObject, useMemo } from "react";

import { startCompletion } from "@codemirror/autocomplete";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";

export function useCodemirrorKeymap({
    handleKeyDown,
}: {
    handleKeyDown: RefObject<((event: KeyboardEvent, view: EditorView) => boolean) | undefined>;
}) {
    // Keymap extension
    const keymapExtension = useMemo(() => {
        return keymap.of([
            // Handle custom keydown events
            {
                any(view, event) {
                    return handleKeyDown.current?.(event, view) ?? false;
                },
            },
            // "Mod" is Ctrl on Windows/Linux, Cmd on macOS
            {
                key: "Mod-i",
                run: startCompletion,
            },
            // Ctrl on Windows
            {
                key: "Ctrl-i",
                run: startCompletion,
            },
            ...defaultKeymap,
            ...historyKeymap,
        ]);
    }, [handleKeyDown]);

    return { keymapExtension };
}
