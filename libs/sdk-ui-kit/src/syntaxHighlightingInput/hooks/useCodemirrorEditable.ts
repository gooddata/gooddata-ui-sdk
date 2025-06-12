// (C) 2025 GoodData Corporation
import { MutableRefObject, useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { Compartment } from "@codemirror/state";

export function useCodemirrorEditable(viewRef: MutableRefObject<EditorView>, disabled?: boolean) {
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
