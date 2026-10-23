// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IStandaloneCodeEditor, type Monaco } from "../monaco/MonacoEditor.js";

export function useAutoformat(
    onChange?: (editor: IStandaloneCodeEditor, monaco: Monaco, value: string) => void,
): (editor: IStandaloneCodeEditor, monaco: Monaco) => void {
    return useCallback(
        (editor: IStandaloneCodeEditor, monaco: Monaco) => {
            editor
                .getAction("editor.action.formatDocument")
                ?.run()
                .then(() => {
                    editor.focus();
                    if (onChange) {
                        onChange(editor, monaco, editor.getValue());
                    }
                });
        },
        [onChange],
    );
}
