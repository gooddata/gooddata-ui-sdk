// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";

import classNames from "classnames";
import * as monaco from "monaco-editor/editor/editor.api.js";
import { FormattedMessage } from "react-intl";
import { type CompletionList } from "vscode-languageserver";

import { type IMetadataObject } from "@gooddata/sdk-model";

import { useCodeTheme } from "../hooks/useCodeTheme.js";
import { type IStandaloneCodeEditor, type Monaco, MonacoEditor } from "../monaco/MonacoEditor.js";
import { type IMaqlEditorIcons } from "../monaco/MonacoEditor.styles.js";
//more info in README.md
import { StatusBar } from "../statusBar/SuggestionStatusBar.js";
import { type MaqlEditorDefaultTheme } from "../theme/default.js";
import { ThemeProvider } from "../theme/theme.js";

import { LANGUAGE } from "./constants.js";
import { useLanguageConfiguration } from "./hooks/useLanguageConfiguration.js";
import { type MonacoHandlers, useMonaco } from "./hooks/useMonaco.js";
import { MaqlEditorClass, MaqlEditorTestClass, MaqlStyles } from "./MaqlEditor.styles.js";

/**
 * @internal
 */
export interface IMaqlEditorApi {
    autoformat: () => void;
    getValue: () => string;
    getValid: () => boolean;
}

/**
 * @internal
 */
export interface IMaqlEditorProps {
    cssTheme?: MaqlEditorDefaultTheme;
    autofocus?: boolean;
    autohint?: boolean;
    decorators?: boolean;
    defaultValue?: string;
    readonly?: boolean;
    inline?: boolean;
    icons?: IMaqlEditorIcons;
    onFocus?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onBlur?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onEditorMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onEditorUpdate?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onChange?: (editor: IStandaloneCodeEditor, monaco: Monaco, value: string) => void;
    onValid?: (editor: IStandaloneCodeEditor, monaco: Monaco, valid: boolean) => void;
    onMetricOpen?: (editor: IStandaloneCodeEditor, object: IMetadataObject) => void;
    ref?: Ref<IMaqlEditorApi | null>;
}

/**
 * @internal
 */
export const MaqlEditor = forwardRef<IMaqlEditorApi, IMaqlEditorProps>(function MaqlEditor(
    {
        readonly = false,
        inline = false,
        autofocus = false,
        decorators = true,
        autohint = false,
        defaultValue = "",
        cssTheme,
        icons,
        onFocus,
        onBlur,
        onEditorMount,
        onEditorUpdate,
        onMetricOpen,
        onValid,
        onChange,
    },
    ref,
) {
    const [suggestionData, setSuggestionData] = useState<[CompletionList | null, HTMLElement | null]>([
        null,
        null,
    ]);
    const [suggestionList, suggestionElement] = suggestionData;

    const [theme, themeData] = useCodeTheme();

    const handlers = useMemo<MonacoHandlers>(
        () => ({
            onFocus,
            onBlur,
            onEditorMount,
            onEditorUpdate,
            onValid,
            onChange,
            onOpen: onMetricOpen,
            onList: (list, el) => setSuggestionData([list, el]),
        }),
        [onBlur, onChange, onEditorMount, onEditorUpdate, onFocus, onValid, onMetricOpen],
    );
    const { onMount, onUpdate, autoformat, getValue, getValid } = useMonaco(
        LANGUAGE,
        autohint,
        decorators,
        handlers,
    );
    const languageConfiguration = useLanguageConfiguration();

    const editor = useRef<IStandaloneCodeEditor | null>(null);
    useImperativeHandle(ref, () => ({
        autoformat: () => editor.current && autoformat(editor.current, monaco),
        getValid: () => (editor.current ? getValid(editor.current, monaco) : false),
        getValue: () => (editor.current ? getValue(editor.current) : ""),
    }));

    return (
        <ThemeProvider theme={cssTheme}>
            <MaqlStyles />
            <MonacoEditor
                inline={inline}
                readonly={readonly}
                autofocus={autofocus}
                className={classNames(MaqlEditorClass, MaqlEditorTestClass)}
                defaultValue={defaultValue}
                language={LANGUAGE}
                languageConfiguration={languageConfiguration}
                themeName={theme}
                themeData={themeData}
                onEditorMount={onMount}
                onEditorUpdate={onUpdate}
                icons={icons}
                ref={editor}
            />
            <StatusBar where={suggestionElement}>
                {suggestionList && suggestionList.isIncomplete && (
                    <FormattedMessage id="metricEditor.status.lotsOfItemsInSuggestionResults" />
                )}
            </StatusBar>
        </ThemeProvider>
    );
});
