// (C) 2024 GoodData Corporation

import React, { useRef, useEffect } from "react";
import CodeMirror from "codemirror";
import * as jsYaml from "js-yaml";

// eslint-disable-next-line import/no-unassigned-import
import "codemirror/addon/lint/lint.js";
// eslint-disable-next-line import/no-unassigned-import
import "codemirror/mode/yaml/yaml.js";

function yamlValidator(text: string) {
    const errors = [];
    try {
        jsYaml.load(text); // Attempt to parse YAML
    } catch (e) {
        // If an error occurs, push it to the errors array
        errors.push({
            from: CodeMirror.Pos(e.mark.line, e.mark.column),
            to: CodeMirror.Pos(e.mark.line, e.mark.column + 1),
            message: e.message,
            severity: "error",
        });
    }
    return errors;
}

export interface ICodeMirrorEditorProps {
    value?: string;
    onChange: (value: string) => void;
}

const TEXTAREA_ID = "configurationEditor";

export const CodeMirrorEditor: React.FC<ICodeMirrorEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        const editor = CodeMirror.fromTextArea(document.getElementById(TEXTAREA_ID) as HTMLTextAreaElement, {
            mode: "yaml",
            lineNumbers: false,
            theme: "default gd-advanced-customization-dialog__theme",
            gutters: ["CodeMirror-lint-markers"], // display lint markers on rows with errors
            lint: {
                getAnnotations: yamlValidator,
                async: false,
            },
            // use space for tabs to adhere to the linter
            extraKeys: {
                Tab: (cm) => cm.execCommand("indentMore"),
                "Shift-Tab": (cm) => cm.execCommand("indentLess"),
            },
        });

        editorRef.current = editor; // store the editor instance in the ref for effects

        editor.on("change", (instance) => {
            const value = instance.getValue(); // get the editor's current value
            onChange(value); // Update the state
        });

        return () => editor.toTextArea(); // Clean up on unmount
    }, [onChange]);

    useEffect(() => {
        if (editorRef.current.getValue() !== value) {
            // Use setValue to update the editor's content
            editorRef.current.setValue(value === undefined ? "" : value);
        }
    }, [value]);

    return <textarea id={TEXTAREA_ID} defaultValue={value} />;
};
