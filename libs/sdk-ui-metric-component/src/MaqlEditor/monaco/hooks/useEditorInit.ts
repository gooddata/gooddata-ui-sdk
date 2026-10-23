// (C) 2021-2026 GoodData Corporation

//more info in README.md
import { useEffect, useRef } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";

import type {
    IDisposable,
    IMonacoEditorProps,
    IStandaloneCodeEditor,
    IStandaloneEditorConstructionOptions,
    IStandaloneThemeData,
} from "../MonacoEditor.js";
import { setupMonacoWorkers } from "../monacoWorkers.js";

import { useEditorOptions } from "./useEditorOptions.js";

export function useEditorInit(
    element: HTMLDivElement | null,
    editor: IStandaloneCodeEditor | null,
    setEditor: (editor: IStandaloneCodeEditor) => void,
    props: Omit<IMonacoEditorProps, "autofocus" | "icons">,
): void {
    const {
        inline = false,
        readonly = false,
        defaultValue = "",
        options,
        themeName,
        themeData,
        language,
        languageConfiguration,
        className,
        onEditorMount = () => {},
        onEditorUpdate = () => {},
        onContentSizeChange = () => {},
    } = props;

    const init = useRef(false);
    const defaultOptions = useEditorOptions(readonly, inline, options);

    useEffect(() => {
        if (!element) {
            return;
        }

        //NOTE: if editor is already initialized and editor is set, update editor
        if (init.current && editor) {
            onEditorUpdate(editor, monaco);
            return initDisposable(editor, onContentSizeChange);
        }

        //NOTE: if editor is already initialized, do not initialize it again
        // This is case where editor is initialized but still not in state
        if (init.current) {
            return;
        }

        // Must run before the first `monaco.editor.create` — Monaco reads `MonacoEnvironment` when it
        // lazily spawns its editor worker.
        setupMonacoWorkers();

        const opts = { ...defaultOptions, automaticLayout: true };
        updateTheme(opts, themeName, themeData);
        updateLanguage(opts, language, languageConfiguration);
        updateClassName(opts, className);
        opts.value = defaultValue;
        init.current = true;

        const currentEditor = monaco.editor.create(element, opts);
        setEditor(currentEditor);
        onEditorMount(currentEditor, monaco);
        onEditorUpdate(currentEditor, monaco);

        return initDisposable(currentEditor, onContentSizeChange);
    }, [
        defaultValue,
        defaultOptions,
        themeName,
        themeData,
        language,
        languageConfiguration,
        className,
        element,
        editor,
        onEditorMount,
        onEditorUpdate,
        onContentSizeChange,
        setEditor,
    ]);
}

function updateTheme(
    options: IStandaloneEditorConstructionOptions,
    themeName?: string,
    themeData?: IStandaloneThemeData,
) {
    if (themeName && themeData) {
        monaco.editor.defineTheme(themeName, themeData);
        options.theme = themeName;
    }
}

function updateLanguage(
    options: IStandaloneEditorConstructionOptions,
    language?: string,
    configuration?: monaco.languages.LanguageConfiguration,
) {
    if (language) {
        monaco.languages.register({ id: language });
        if (configuration) {
            monaco.languages.setLanguageConfiguration(language, configuration);
        }
        options.language = language;
    }
}

function updateClassName(options: IStandaloneEditorConstructionOptions, className?: string) {
    if (className) {
        options.extraEditorClassName = className;
    }
}

function initDisposable(
    editor: IStandaloneCodeEditor,
    onContentSizeChange: IMonacoEditorProps["onContentSizeChange"],
) {
    const disposable: Array<IDisposable> = [];
    disposable.push(onContentSizeChanged(editor, onContentSizeChange));
    return () =>
        disposable.forEach((dis) => {
            dis.dispose();
        });
}

function onContentSizeChanged(
    editor: IStandaloneCodeEditor,
    onContentSizeChange: IMonacoEditorProps["onContentSizeChange"],
) {
    return editor.onDidContentSizeChange(() =>
        onContentSizeChange?.(editor, monaco, editor.getContentWidth(), editor.getContentHeight()),
    );
}
