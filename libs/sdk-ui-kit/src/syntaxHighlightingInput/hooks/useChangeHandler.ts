// (C) 2025-2026 GoodData Corporation

import { type RefObject, useMemo } from "react";

import { Transaction } from "@codemirror/state";
import { EditorView, type ViewUpdate } from "@codemirror/view";

export function useChangeHandler({
    handleChange,
    handleCursor,
}: {
    handleChange: RefObject<(value: string) => void>;
    handleCursor: RefObject<((from: number, to: number) => void) | undefined>;
}) {
    // Create an extension for handling changes
    const changeHandlerExtension = useMemo(() => {
        return EditorView.updateListener.of((update: ViewUpdate) => {
            // A change whose every transaction is annotated as remote is the value-sync dispatch
            // from `useCodemirrorChange` echoing the controlled value back in. Reporting it would
            // hand consumers their own value a second time, so each of them would have to keep
            // bookkeeping just to tell the echo from a real edit.
            const isRemoteOnly =
                update.transactions.length > 0 &&
                update.transactions.every((tr) => tr.annotation(Transaction.remote));
            if (update.docChanged && !isRemoteOnly) {
                handleChange.current?.(update.state.doc.toString());
            }
            if (handleCursor.current && update.selectionSet) {
                const range = update.state.selection.main;
                handleCursor.current(range.from, range.to);
            }
        });
    }, [handleChange, handleCursor]);

    return {
        changeHandlerExtension,
    };
}
