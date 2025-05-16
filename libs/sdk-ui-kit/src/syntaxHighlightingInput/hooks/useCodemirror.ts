// (C) 2025 GoodData Corporation
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { Compartment, EditorSelection, EditorState, Extension, Transaction } from "@codemirror/state";
import { EditorView, keymap, placeholder, ViewUpdate } from "@codemirror/view";
import { bracketMatching, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { tags as t } from "@lezer/highlight";

// Custom syntax highlighting
const customHighlightStyle = HighlightStyle.define([
    { tag: t.punctuation, color: "#94a1ad" },
    { tag: t.bracket, color: "#94a1ad" },
    { tag: t.variableName, color: "#464e56" },
    { tag: t.string, color: "#a11" },
    { tag: t.special(t.variableName), color: "#13b1e2", fontWeight: "bold" },
    { tag: t.standard(t.variableName), color: "#00c18e", fontWeight: "bold" },
    { tag: t.keyword, color: "#ab55a3", fontWeight: "bold" },
]);

export interface IUseCodemirrorProps {
    value?: string;
    label?: string;
    placeholderText?: string;
    disabled?: boolean;
    extensions?: Extension[];
    onChange: (value: string) => void;
    onApi?: (view: EditorView | null) => void;
    onCursor?: (from: number, to: number) => void;
    onKeyDown?: (event: KeyboardEvent, view: EditorView) => boolean;
}

export function useCodemirror({
    value = "",
    label,
    disabled,
    placeholderText,
    extensions,
    onApi,
    onKeyDown,
    onCursor,
    onChange,
}: IUseCodemirrorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView>();

    const handleKeyDownRef = useRef(onKeyDown);
    handleKeyDownRef.current = onKeyDown;

    const handleChangeRef = useRef(onChange);
    handleChangeRef.current = onChange;

    const handleCursorRef = useRef(onCursor);
    handleCursorRef.current = onCursor;

    // Create an extension for handling changes
    const changeHandler = useMemo(() => {
        return EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
                handleChangeRef.current?.(update.state.doc.toString());
            }
            if (handleCursorRef.current && update.selectionSet) {
                const range = update.state.selection.main;
                handleCursorRef.current(range.from, range.to);
            }
        });
    }, []);

    // Disable autofocus
    const disableAutofocus = useMemo(() => EditorView.contentAttributes.of({ autofocus: "false" }), []);

    // Placeholder
    const placeholderExtension = useMemo(() => {
        return placeholderText ? placeholder(placeholderText) : [];
    }, [placeholderText]);

    //ARIA
    const ariaExtension = EditorView.contentAttributes.of({
        "aria-label": label || placeholderText,
    });

    // Keymap extension
    const keymapExtension = useMemo(() => {
        return keymap.of([
            {
                any(view, event) {
                    return handleKeyDownRef.current?.(event, view) ?? false;
                },
            },
            ...defaultKeymap,
            ...historyKeymap,
        ]);
    }, []);

    // Editable compartment
    const { editableCompartmentExtension } = useCodemirrorEditable(viewRef, disabled);

    // Create the editor only once
    useEffect(() => {
        if (!editorRef.current) {
            return undefined;
        }

        const view = new EditorView({
            state: EditorState.create({
                doc: value,
                extensions: [
                    bracketMatching(),
                    keymapExtension,
                    syntaxHighlighting(customHighlightStyle),
                    EditorView.lineWrapping,
                    disableAutofocus,
                    changeHandler,
                    placeholderExtension,
                    editableCompartmentExtension,
                    ariaExtension,
                    ...extensions,
                ],
            }),
            parent: editorRef.current,
        });

        viewRef.current = view;
        // Expose the editor view to the parent component
        onApi?.(view);

        return () => {
            onApi?.(null);
            view.destroy();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle external value changes
    useCodemirrorChange(viewRef, value);

    return {
        editorRef,
        viewRef,
    };
}

function useCodemirrorEditable(viewRef: MutableRefObject<EditorView>, disabled?: boolean) {
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

function useCodemirrorChange(viewRef: MutableRefObject<EditorView>, value: string) {
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
