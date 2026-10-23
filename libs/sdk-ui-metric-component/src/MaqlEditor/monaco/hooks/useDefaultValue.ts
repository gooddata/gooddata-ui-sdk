// (C) 2021-2026 GoodData Corporation

import { useEffect } from "react";

import type { IStandaloneCodeEditor } from "../MonacoEditor.js";

export function useDefaultValue(editor: IStandaloneCodeEditor | null, defaultValue: string): void {
    useEffect(() => {
        if (!editor) {
            return;
        }

        const editorModel = editor.getModel();
        const currentValue = editorModel?.getValue();

        if (defaultValue !== currentValue) {
            editor.setValue(defaultValue);
        }
    }, [defaultValue, editor]);
}
