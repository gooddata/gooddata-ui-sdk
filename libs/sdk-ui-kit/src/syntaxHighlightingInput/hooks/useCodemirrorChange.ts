// (C) 2025 GoodData Corporation
import { MutableRefObject, useEffect } from "react";

import { EditorSelection, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export function useCodemirrorChange(viewRef: MutableRefObject<EditorView>, value: string) {
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
            const adjustedSelection = EditorSelection.create(
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
    }, [value, viewRef]);
}
