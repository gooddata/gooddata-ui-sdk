// (C) 2021-2026 GoodData Corporation

import { useAutoformat } from "../../hooks/useAutoformat.js";
import { useCleanCallback } from "../../hooks/useCleanCallback.js";
import { useMountCallback } from "../../hooks/useMountCallback.js";
import { useUpdateCallback } from "../../hooks/useUpdateCallback.js";
import { useValueCallbacks } from "../../hooks/useValueCallbacks.js";
import { type IStandaloneCodeEditor, type Monaco } from "../../monaco/MonacoEditor.js";

import { useDocumentFormatting } from "./useDocumentFormatting.js";
import { useSyntaxHighlight } from "./useSyntaxHighlight.js";

export type MonacoHandlers = {
    onFocus?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onBlur?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onEditorMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onChange?: (editor: IStandaloneCodeEditor, monaco: Monaco, value: string) => void;
    onValid?: (editor: IStandaloneCodeEditor, monaco: Monaco, valid: boolean) => void;
};

export function useMonaco(
    languageId: string,
    handlers: MonacoHandlers,
): {
    onMount: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onUpdate: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    autoformat: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
} {
    const { onFocus, onBlur, onEditorMount, onValid, onChange } = handlers;

    useSyntaxHighlight(languageId);
    useDocumentFormatting(languageId);

    const { getValue, getValid } = useValueCallbacks();

    const [mountCallback, disposableMount] = useMountCallback({}, { onEditorMount });

    const [updateCallback, disposableUpdate] = useUpdateCallback(
        {
            getValue,
            getValid,
        },
        { onFocus, onBlur, onValid, onChange },
    );

    const autoformat = useAutoformat(onChange);

    useCleanCallback(disposableMount, disposableUpdate);

    return {
        onMount: mountCallback,
        onUpdate: updateCallback,
        autoformat,
    };
}
