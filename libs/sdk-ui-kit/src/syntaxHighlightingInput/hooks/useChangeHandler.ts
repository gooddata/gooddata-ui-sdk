// (C) 2025 GoodData Corporation
import { MutableRefObject, useMemo } from "react";
import { EditorView, ViewUpdate } from "@codemirror/view";

export function useChangeHandler({
    handleChange,
    handleCursor,
}: {
    handleChange: MutableRefObject<(value: string) => void>;
    handleCursor: MutableRefObject<(from: number, to: number) => void>;
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
