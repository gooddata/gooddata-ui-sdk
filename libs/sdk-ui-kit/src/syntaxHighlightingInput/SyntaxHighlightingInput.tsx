// (C) 2020-2023 GoodData Corporation
import React, { useRef, useEffect } from "react";
import cx from "classnames";
import { EditorView, keymap, placeholder, ViewUpdate } from "@codemirror/view";
import { EditorState, Extension, Transaction, EditorSelection } from "@codemirror/state";
import { bracketMatching, syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";

// Disable autofocus
const disableAutofocus = EditorView.contentAttributes.of({ autofocus: "false" });

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

/**
 * @internal
 */
export interface ISyntaxHighlightingInputProps {
    value: string;
    onChange: (value: string) => void;
    onCursor?: (from: number, to: number) => void;
    placeholder?: string;
    extensions?: Extension[];
    className?: string;
}

/**
 * @internal
 */
export const SyntaxHighlightingInput: React.FC<ISyntaxHighlightingInputProps> = (props) => {
    const { value, onChange, onCursor, placeholder: placeholderText, className, extensions = [] } = props;

    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView>();

    // Create the editor only once
    useEffect(() => {
        if (!editorRef.current) {
            return undefined;
        }

        // Create an extension for handling changes
        const changeHandler = EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
                const newValue = update.state.doc.toString();
                if (newValue !== value) {
                    onChange(newValue);
                }
            }
            if (onCursor && update.selectionSet) {
                const range = update.state.selection.main;
                onCursor(range.from, range.to);
            }
        });

        const view = new EditorView({
            state: EditorState.create({
                doc: value,
                extensions: [
                    bracketMatching(),
                    keymap.of([
                        ...defaultKeymap,
                        ...historyKeymap,
                    ]),
                    syntaxHighlighting(customHighlightStyle),
                    EditorView.lineWrapping,
                    disableAutofocus,
                    changeHandler,
                    placeholderText ? placeholder(placeholderText) : [],
                    ...extensions,
                ],
            }),
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => view.destroy();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                selection.mainIndex
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
    }, [value]);

    return <div className={cx(className, "gd-input-syntax-highlighting-input")} ref={editorRef} />;
};
