// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IStandaloneCodeEditor } from "../monaco/MonacoEditor.js";

export function useCopyToClipboard(): (editor: IStandaloneCodeEditor | null | undefined) => boolean {
    return useCallback((editor: IStandaloneCodeEditor | null | undefined) => {
        if (editor) {
            const range = editor.getModel()?.getFullModelRange();
            if (range) {
                editor.setSelection(range);
                editor.focus();
                editor.trigger("editor", "editor.action.clipboardCopyAction", {});
                return true;
            }
        }
        return false;
    }, []);
}
