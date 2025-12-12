// (C) 2025 GoodData Corporation

import { type RefObject, useEffect, useRef } from "react";

import { Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export function useCodemirrorEditable(viewRef: RefObject<EditorView | null>, disabled?: boolean) {
    // Editable compartment
    const editableCompartmentRef = useRef(new Compartment());
    const editableCompartmentExtension = editableCompartmentRef.current.of(EditorView.editable.of(!disabled));

    // Handle disabled state changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) {
            return;
        }

        // Update the editable compartment based on the disabled prop
        view.dispatch({
            effects: editableCompartmentRef.current.reconfigure(EditorView.editable.of(!disabled)),
        });
    }, [disabled, viewRef]);

    return {
        editableCompartmentExtension,
    };
}
