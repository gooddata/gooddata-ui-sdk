// (C) 2021-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type CompletionList } from "vscode-languageserver";

import { type IMetadataObject } from "@gooddata/sdk-model";

import { useProp } from "../../../shared/hooks/useProp.js";
import { useAutoformat } from "../../hooks/useAutoformat.js";
import { useCleanCallback } from "../../hooks/useCleanCallback.js";
import { useMountCallback } from "../../hooks/useMountCallback.js";
import { useUpdateCallback } from "../../hooks/useUpdateCallback.js";
import { useValueCallbacks } from "../../hooks/useValueCallbacks.js";
import { type IStandaloneCodeEditor, type Monaco } from "../../monaco/MonacoEditor.js";
import { onSuggestionElement } from "../../statusBar/SuggestionStatusBar.js";

import { useAutocomplete } from "./useAutocomplete.js";
import { useDecoration } from "./useDecoration.js";
import { useDocumentFormatting } from "./useDocumentFormatting.js";
import { useHover } from "./useHover.js";
import { useLanguageService } from "./useLanguageService.js";
import { useLanguageServiceInitializer } from "./useLanguageServiceInitializer.js";
import { useSemanticHighlight } from "./useSemanticHighlight.js";
import { useSyntaxHighlight } from "./useSyntaxHighlight.js";
import { useValidation } from "./useValidation.js";

export type MonacoHandlers = {
    onFocus?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onBlur?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onEditorMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onEditorUpdate?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onList: (list: CompletionList | null, el: HTMLElement | null) => void;
    onChange?: (editor: IStandaloneCodeEditor, monaco: Monaco, value: string) => void;
    onValid?: (editor: IStandaloneCodeEditor, monaco: Monaco, valid: boolean) => void;
    onOpen?: (editor: IStandaloneCodeEditor, object: IMetadataObject) => void;
};

export function useMonaco(
    languageId: string,
    autohint: boolean,
    decorators: boolean,
    handlers: MonacoHandlers,
): {
    onMount: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onUpdate: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    autoformat: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    getValue: (editor: IStandaloneCodeEditor) => string;
    getValid: (editor: IStandaloneCodeEditor, monaco: Monaco) => boolean;
} {
    const [hints, setHints] = useProp(autohint);
    const [list, setList] = useState<CompletionList | null>(null);
    const [listElement, setListElement] = useState<HTMLElement | null>(null);
    const [codeEditor, setCodeEditor] = useState<IStandaloneCodeEditor | null>(null);
    const { onFocus, onBlur, onEditorMount, onEditorUpdate, onValid, onList, onChange, onOpen } = handlers;

    const languageService = useLanguageService();
    const initializeData = useLanguageServiceInitializer(languageService);
    const validation = useValidation(languageService);
    const decoration = useDecoration(languageService, decorators);

    useEffect(() => onList(list, listElement), [list, listElement, onList]);
    useEffect(() => decoration(codeEditor), [codeEditor, decoration]);

    useAutocomplete(languageId, languageService, initializeData, setList);
    useSyntaxHighlight(languageId);
    useSemanticHighlight(languageId, languageService, initializeData);
    useHover(codeEditor, languageId, languageService, initializeData, onOpen);
    useDocumentFormatting(languageId, languageService);

    const { getValue, getValid } = useValueCallbacks();

    const [mountCallback, disposableMount] = useMountCallback(
        {
            setCodeEditor,
            afterStart: useCallback(
                (editor: IStandaloneCodeEditor, monaco: Monaco) => {
                    //suggestion element
                    onSuggestionElement(editor, setListElement);
                    //validate and decorate on start
                    decoration(editor);
                    validation(editor, monaco);
                },
                [decoration, validation],
            ),
        },
        { onEditorMount },
    );

    const [updateCallback, disposableUpdate] = useUpdateCallback(
        {
            getValue,
            getValid,
            afterFocus: useCallback(
                (editor: IStandaloneCodeEditor) => {
                    if (hints) {
                        editor.trigger("", "editor.action.marker.next", "");
                    }
                },
                [hints],
            ),
            afterChange: useCallback(
                (editor: IStandaloneCodeEditor, monaco: Monaco) => {
                    decoration(editor);
                    validation(editor, monaco);
                    setHints(false);
                },
                [decoration, setHints, validation],
            ),
            afterValidate: useCallback(
                (_editor: IStandaloneCodeEditor, _monaco: Monaco, valid: boolean) => {
                    if (valid) {
                        setHints(false);
                    }
                },
                [setHints],
            ),
        },
        { onFocus, onBlur, onValid, onChange, onEditorUpdate },
    );

    const autoformat = useAutoformat(onChange);

    useCleanCallback(disposableMount, disposableUpdate);

    return {
        onMount: mountCallback,
        onUpdate: updateCallback,
        autoformat,
        getValue,
        getValid,
    };
}
