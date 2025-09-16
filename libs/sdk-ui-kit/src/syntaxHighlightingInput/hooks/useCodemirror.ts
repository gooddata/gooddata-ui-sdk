// (C) 2025 GoodData Corporation

import { useEffect, useRef } from "react";

import { HighlightStyle, bracketMatching, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

import { useAutocompletion } from "./useAutocompletion.js";
import { useChangeHandler } from "./useChangeHandler.js";
import { useCodemirrorChange } from "./useCodemirrorChange.js";
import { useCodemirrorEditable } from "./useCodemirrorEditable.js";
import { useCodemirrorEvents } from "./useCodemirrorEvents.js";
import { useCodemirrorKeymap } from "./useCodemirrorKeymap.js";
import { useCodemirrorOptions } from "./useCodemirrorOptions.js";
import { IUseEventHandlersProps, useEventHandlers } from "./useEventHandlers.js";

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

export interface IUseCodemirrorProps extends IUseEventHandlersProps {
    value?: string;
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
}

export function useCodemirror({
    value = "",
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
}: IUseCodemirrorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

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
                    ...beforeExtensions,
                    bracketMatching(),
                    domEventsExtension,
                    keymapExtension,
                    syntaxHighlighting(customHighlightStyle),
                    EditorView.lineWrapping,
                    disableAutofocusExtension,
                    changeHandlerExtension,
                    placeholderExtension,
                    editableCompartmentExtension,
                    ariaExtension,
                    autocompletionExtension,
                    autocompleteHoverExtension,
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
