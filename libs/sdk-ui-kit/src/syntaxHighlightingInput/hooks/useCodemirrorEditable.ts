// (C) 2025-2026 GoodData Corporation

import { type RefObject, useEffect, useRef } from "react";

import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

// `EditorView.editable` only governs the DOM's contenteditable, which blocks typing; keymap
// commands (Enter, deletions, undo) consult `EditorState.readOnly` instead, so both must flip
// together or a "read-only" editor still mutates from the keyboard.
const editableExtensions = (disabled: boolean) => [
    EditorView.editable.of(!disabled),
    EditorState.readOnly.of(disabled),
];

export function useCodemirrorEditable(viewRef: RefObject<EditorView | null>, disabled?: boolean) {
    // Editable compartment
    const editableCompartmentRef = useRef(new Compartment());
    const editableCompartmentExtension = editableCompartmentRef.current.of(editableExtensions(!!disabled));

    // Handle disabled state changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) {
            return;
        }

        // Update the editable compartment based on the disabled prop
        view.dispatch({
            effects: editableCompartmentRef.current.reconfigure(editableExtensions(!!disabled)),
        });
    }, [disabled, viewRef]);

    return {
        editableCompartmentExtension,
    };
}
