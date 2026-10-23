// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import type { IMonacoEditorProps, IStandaloneCodeEditor } from "../MonacoEditor.js";

import { useDefaultValue } from "./useDefaultValue.js";
import { useEditorInit } from "./useEditorInit.js";

export function useMonaco(
    element: HTMLDivElement | null,
    props: Omit<IMonacoEditorProps, "autofocus" | "icons">,
): IStandaloneCodeEditor | null {
    const {
        defaultValue = "",
        themeName,
        themeData,
        language,
        languageConfiguration,
        className,
        inline,
        readonly,
        options,
        onEditorMount = () => {},
        onEditorUpdate = () => {},
        onContentSizeChange = () => {},
    } = props;
    const [editor, setEditor] = useState<IStandaloneCodeEditor | null>(null);

    useDefaultValue(editor, defaultValue);
    useEditorInit(element, editor, setEditor, {
        inline,
        options,
        readonly,
        defaultValue,
        themeData,
        language,
        languageConfiguration,
        themeName,
        className,
        onEditorMount,
        onEditorUpdate,
        onContentSizeChange,
    });

    return editor;
}
