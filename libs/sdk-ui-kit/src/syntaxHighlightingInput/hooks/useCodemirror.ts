// (C) 2025-2026 GoodData Corporation

import { useEffect, useRef } from "react";

import { type HighlightStyle, bracketMatching, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, drawSelection } from "@codemirror/view";

import { useAutocompletion } from "./useAutocompletion.js";
import { useChangeHandler } from "./useChangeHandler.js";
import { type ExternalChangeSelection, useCodemirrorChange } from "./useCodemirrorChange.js";
import { useCodemirrorEditable } from "./useCodemirrorEditable.js";
import { useCodemirrorEvents } from "./useCodemirrorEvents.js";
import { useCodemirrorKeymap } from "./useCodemirrorKeymap.js";
import { useCodemirrorOptions } from "./useCodemirrorOptions.js";
import { type IUseEventHandlersProps, useEventHandlers } from "./useEventHandlers.js";

export interface IUseCodemirrorProps extends IUseEventHandlersProps {
    value?: string;
    highlightStyle: HighlightStyle;
    label?: string;
    placeholderText?: string;
    disabled?: boolean;
    autocompletion?: {
        aboveCursor?: boolean;
        whenTyping?: boolean;
        whenTypingDelay?: number;
    };
    beforeExtensions?: Extension[];
    extensions?: Extension[];
    onApi?: (view: EditorView | null) => void;
    /** Where the selection goes when the controlled value is replaced from outside. */
    externalChangeSelection?: ExternalChangeSelection;
}

export function useCodemirror({
    value = "",
    highlightStyle,
    label,
    disabled,
    autocompletion,
    placeholderText,
    extensions,
    beforeExtensions,
    onCompletion,
    onApi,
    onKeyDown,
    onCursor,
    onChange,
    onBlur,
    onFocus,
    externalChangeSelection,
}: IUseCodemirrorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const highlightCompartmentRef = useRef(new Compartment());

    const { handleCompletion, handleChange, handleKeyDown, handleCursor, handleFocus, handleBlur } =
        useEventHandlers({
            onChange,
            onKeyDown,
            onCursor,
            onCompletion,
            onFocus,
            onBlur,
        });

    // Create an extension for handling changes
    const { changeHandlerExtension } = useChangeHandler({ handleChange, handleCursor });
    // Create settings for the editor
    const { placeholderExtension, ariaExtension, disableAutofocusExtension } = useCodemirrorOptions({
        placeholderText,
        labelText: label,
    });
    // Create keymap extension
    const { keymapExtension } = useCodemirrorKeymap({ handleKeyDown });
    // Create dom events extension
    const { domEventsExtension } = useCodemirrorEvents({ handleFocus, handleBlur });
    // Create editable compartment extension
    const { editableCompartmentExtension } = useCodemirrorEditable(viewRef, disabled);
    // Create autocompletion extension
    const { autocompletionExtension, autocompleteHoverExtension } = useAutocompletion({
        handleCompletion,
        aboveCursor: autocompletion?.aboveCursor ?? false,
        whenTyping: autocompletion?.whenTyping ?? true,
        activateOnTypingDelay: autocompletion?.whenTypingDelay,
    });

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
                    drawSelection(),
                    domEventsExtension,
                    ...(beforeExtensions ?? []),
                    keymapExtension,
                    highlightCompartmentRef.current.of(syntaxHighlighting(highlightStyle)),
                    EditorView.lineWrapping,
                    disableAutofocusExtension,
                    changeHandlerExtension,
                    placeholderExtension,
                    editableCompartmentExtension,
                    ariaExtension,
                    autocompletionExtension,
                    autocompleteHoverExtension,
                    ...(extensions ?? []),
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
    }, []); // oxlint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        viewRef.current?.dispatch({
            effects: highlightCompartmentRef.current.reconfigure(syntaxHighlighting(highlightStyle)),
        });
    }, [highlightStyle]);

    // Handle external value changes
    useCodemirrorChange(viewRef, value, externalChangeSelection);

    return {
        editorRef,
        viewRef,
    };
}
