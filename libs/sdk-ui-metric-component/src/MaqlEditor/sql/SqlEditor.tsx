// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useImperativeHandle, useMemo, useRef } from "react";

import classNames from "classnames";

import { useCodeTheme } from "../hooks/useCodeTheme.js";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard.js";
import {
    type IStandaloneCodeEditor,
    type IStandaloneEditorConstructionOptions,
    type Monaco,
    MonacoEditor,
} from "../monaco/MonacoEditor.js";
import { type DefaultTheme } from "../theme/default.js";
import { ThemeProvider } from "../theme/theme.js";

import { LANGUAGE } from "./constants.js";
import { formatValue } from "./formatter.js";
import { useLanguageConfiguration } from "./hooks/useLanguageConfiguration.js";
import { type MonacoHandlers, useMonaco } from "./hooks/useMonaco.js";
import { SqlEditorClass, SqlEditorTestClass } from "./SqlEditor.styles.js";

export interface ISqlEditorApi {
    copy: () => boolean;
}

export interface ISqlEditorProps {
    cssTheme?: DefaultTheme;
    autofocus?: boolean;
    defaultValue?: string;
    readonly?: boolean;
    inline?: boolean;
    onFocus?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onBlur?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onEditorMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onChange?: (editor: IStandaloneCodeEditor, monaco: Monaco, value: string) => void;
    onValid?: (editor: IStandaloneCodeEditor, monaco: Monaco, valid: boolean) => void;
    ref?: Ref<ISqlEditorApi | null>;
}

export const SqlEditor = forwardRef<ISqlEditorApi, ISqlEditorProps>(function SqlEditor(
    {
        readonly = false,
        inline = false,
        autofocus = false,
        defaultValue = "",
        cssTheme,
        onFocus,
        onBlur,
        onEditorMount,
        onValid,
        onChange,
    },
    ref,
) {
    const [theme, themeData] = useCodeTheme();

    const handlers = useMemo<MonacoHandlers>(
        () => ({
            onFocus,
            onBlur,
            onEditorMount,
            onValid,
            onChange,
        }),
        [onBlur, onChange, onEditorMount, onFocus, onValid],
    );
    const { onMount, onUpdate } = useMonaco(LANGUAGE, handlers);
    const languageConfiguration = useLanguageConfiguration();
    const options = useEditorOptions();
    const formattedValue = useFormattedValue(defaultValue);

    const copyToClipboard = useCopyToClipboard();

    const editor = useRef<IStandaloneCodeEditor | null>(null);
    useImperativeHandle(ref, () => ({
        copy: () => copyToClipboard(editor.current),
    }));

    return (
        <ThemeProvider theme={cssTheme}>
            <MonacoEditor
                inline={inline}
                options={options}
                readonly={readonly}
                autofocus={autofocus}
                className={classNames(SqlEditorClass, SqlEditorTestClass)}
                defaultValue={formattedValue}
                language={LANGUAGE}
                languageConfiguration={languageConfiguration}
                themeName={theme}
                themeData={themeData}
                onEditorMount={onMount}
                onEditorUpdate={onUpdate}
                ref={editor}
            />
        </ThemeProvider>
    );
});

function useEditorOptions() {
    return useMemo(
        () =>
            ({
                lineNumbers: "off",
                lineNumbersMinChars: 0,
                folding: false,
            }) as Partial<IStandaloneEditorConstructionOptions>,
        [],
    );
}

function useFormattedValue(value: string) {
    return useMemo(() => {
        return formatValue(value, { tabSize: 4, insertSpaces: true });
    }, [value]);
}
