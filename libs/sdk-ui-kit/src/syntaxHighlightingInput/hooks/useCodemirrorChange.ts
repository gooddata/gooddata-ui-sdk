// (C) 2025-2026 GoodData Corporation

import { type RefObject, useEffect } from "react";

import { EditorSelection, Transaction } from "@codemirror/state";
import { type EditorView } from "@codemirror/view";

/**
 * Where the selection goes when the controlled value is replaced from outside.
 *
 * - `"clamp"` keeps the current selection, clamped into the new document's bounds.
 * - `"end"` puts the cursor at the end of the new document — for editors whose external replaces
 *   mean "a new document" (an applied example, a re-format), where the old offset is meaningless
 *   and a subsequent insert-at-cursor should append rather than land at a stale position.
 *
 * @internal
 */
export type ExternalChangeSelection = "clamp" | "end";

export function useCodemirrorChange(
    viewRef: RefObject<EditorView | null>,
    value: string,
    externalChangeSelection: ExternalChangeSelection = "clamp",
) {
    // Handle external value changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const currentValue = view.state.doc.toString();
        if (currentValue !== value) {
            const selection = view.state.selection;
            const hasFocus = view.hasFocus;
            const newLength = value.length;

            // Adjust selection to stay within bounds of new content
            const adjustedSelection =
                externalChangeSelection === "end"
                    ? EditorSelection.single(newLength)
                    : EditorSelection.create(
                          selection.ranges.map((range) => {
                              const from = Math.min(range.from, newLength);
                              const to = Math.min(range.to, newLength);
                              return EditorSelection.range(from, to);
                          }),
                          selection.mainIndex,
                      );

            view.dispatch({
                changes: { from: 0, to: currentValue.length, insert: value },
                selection: adjustedSelection,
                annotations: [
                    // Mark this as a remote change to avoid triggering the change handler
                    Transaction.remote.of(true),
                ],
            });

            if (hasFocus) {
                view.focus();
            }
        }
    }, [value, viewRef, externalChangeSelection]);
}
