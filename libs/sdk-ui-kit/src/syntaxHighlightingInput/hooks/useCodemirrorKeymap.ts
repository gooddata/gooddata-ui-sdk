// (C) 2025-2026 GoodData Corporation

import { type RefObject, useMemo } from "react";

import { startCompletion } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { type EditorView, keymap } from "@codemirror/view";

/** @internal */
export function isApplePlatform(): boolean {
    return /Mac|iPhone|iPad|iPod/.test(globalThis.navigator?.platform ?? "");
}

export function useCodemirrorKeymap({
    handleKeyDown,
}: {
    handleKeyDown: RefObject<((event: KeyboardEvent, view: EditorView) => boolean) | undefined>;
}) {
    // Keymap extension. The history state extension comes with it: `historyKeymap` binds the
    // undo/redo commands, but without `history()` installed they have nothing to operate on.
    const keymapExtension = useMemo(() => {
        return [
            history(),
            keymap.of([
                // Handle custom keydown events
                {
                    any(view, event) {
                        return handleKeyDown.current?.(event, view) ?? false;
                    },
                },
                // Both Meta-i and Ctrl-i are bound so the named shortcut works even when the platform check is wrong.
                {
                    key: "Meta-i",
                    run: startCompletion,
                },
                {
                    key: "Ctrl-i",
                    run: startCompletion,
                },
                ...defaultKeymap,
                ...historyKeymap,
            ]),
        ];
    }, [handleKeyDown]);

    return { keymapExtension };
}
