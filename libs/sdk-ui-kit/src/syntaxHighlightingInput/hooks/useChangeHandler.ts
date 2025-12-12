// (C) 2025 GoodData Corporation

import { type RefObject, useMemo } from "react";

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
            if (update.docChanged) {
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
