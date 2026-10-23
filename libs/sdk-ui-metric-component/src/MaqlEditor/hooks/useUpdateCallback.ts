// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useRef } from "react";

import {
    type IDisposable,
    type IMarkersContribution,
    type IStandaloneCodeEditor,
    type Monaco,
} from "../monaco/MonacoEditor.js";

export type UseUpdateHandlers = {
    onFocus?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onBlur?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onChange?: (editor: IStandaloneCodeEditor, monaco: Monaco, value: string) => void;
    onValid?: (editor: IStandaloneCodeEditor, monaco: Monaco, valid: boolean) => void;
    onEditorUpdate?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
};

type UseUpdateCallbacks = {
    getValue: (editor: IStandaloneCodeEditor) => string;
    getValid: (editor: IStandaloneCodeEditor, monaco: Monaco) => boolean;
    afterFocus?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    afterChange?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    afterValidate?: (editor: IStandaloneCodeEditor, monaco: Monaco, valid: boolean) => void;
};

export function useUpdateCallback(
    { afterFocus, afterValidate, afterChange, getValid, getValue }: UseUpdateCallbacks,
    { onFocus, onBlur, onChange, onValid, onEditorUpdate }: UseUpdateHandlers,
): [(editor: IStandaloneCodeEditor, monaco: Monaco) => void, MutableRefObject<IDisposable[]>] {
    const disposable = useRef<Array<IDisposable>>([]);

    const callback = useCallback(
        (editor: IStandaloneCodeEditor, monaco: Monaco) => {
            disposable.current.forEach((item) => item.dispose());
            disposable.current = [];
            if (onEditorUpdate) {
                onEditorUpdate(editor, monaco);
            }

            const onDidChangeModelContentDisposable = editor.onDidChangeModelContent(() => {
                if (afterChange) {
                    afterChange(editor, monaco);
                }
                if (onChange) {
                    onChange(editor, monaco, getValue(editor));
                }
            });
            disposable.current.push(onDidChangeModelContentDisposable);

            const onDidChangeMarkersDisposable = monaco.editor.onDidChangeMarkers(() => {
                const valid = getValid(editor, monaco);
                if (valid) {
                    //NOTE: Close invalid markers but do not focus editor
                    const markers = editor.getContribution<IMarkersContribution>(
                        "editor.contrib.markerController",
                    );
                    if (markers) {
                        markers.close(false);
                    }
                    if (afterValidate) {
                        afterValidate(editor, monaco, valid);
                    }
                }
                if (onValid) {
                    onValid(editor, monaco, valid);
                }
            });

            disposable.current.push(onDidChangeMarkersDisposable);
            disposable.current.push(
                editor.onDidFocusEditorWidget(() => {
                    if (afterFocus) {
                        afterFocus(editor, monaco);
                    }
                    if (onFocus) {
                        onFocus(editor, monaco);
                    }
                }),
            );
            disposable.current.push(
                editor.onDidBlurEditorText(() => {
                    if (onBlur) {
                        onBlur(editor, monaco);
                    }
                }),
            );
        },
        [
            afterChange,
            onChange,
            getValue,
            getValid,
            onValid,
            afterValidate,
            afterFocus,
            onFocus,
            onBlur,
            onEditorUpdate,
        ],
    );

    return [callback, disposable];
}
