// (C) 2024-2025 GoodData Corporation

import { useEffect, useRef } from "react";

import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Diagnostic, lintGutter, linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView, ViewUpdate, keymap } from "@codemirror/view";
import * as jsYaml from "js-yaml";

export interface ICodeMirrorEditorProps {
    value?: string;
    onChange: (value: string) => void;
}

// YAML validator
function yamlValidator(view: EditorView): Diagnostic[] {
    const errors: Diagnostic[] = [];

    try {
        jsYaml.load(view.state.doc.toString());
    } catch (e) {
        if (e && typeof e === "object" && "mark" in e && "message" in e) {
            const yamlError = e as { mark: { position: number }; message: string };
            errors.push({
                from: yamlError.mark.position - 1,
                to: yamlError.mark.position - 1,
                message: yamlError.message,
                severity: "error",
            });
        }
    }
    return errors;
}

export function CodeMirrorEditor({ value, onChange }: ICodeMirrorEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!editorRef.current) {
            return undefined;
        }

        const changeHandler = EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
                const newValue = update.state.doc.toString();
                onChange(newValue);
            }
        });

        const view = new EditorView({
            state: EditorState.create({
                doc: viewRef.current?.state.doc.toString() ?? "",
                extensions: [
                    history(),
                    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                    keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
                    yaml(),
                    EditorView.lineWrapping,
                    linter(yamlValidator, { markerFilter: () => [] }),
                    lintGutter(),
                    changeHandler,
                ],
            }),
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => view.destroy();
    }, [onChange]);

    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const currentValue = view.state.doc.toString();
        if (currentValue !== value) {
            view.dispatch({
                changes: { from: 0, to: currentValue.length, insert: value || "" },
            });
        }
    }, [value]);

    return <div className="gd-advanced-customization-dialog__theme" ref={editorRef} />;
}
